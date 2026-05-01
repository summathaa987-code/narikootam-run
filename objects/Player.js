/**
 * Player.js
 * Full player entity: procedural sprite sheet, frame animations,
 * dust particles, name label, squash/stretch, respawn system.
 *
 * Sprite sheet strategy:
 *   - Each frame is drawn into its own generateTexture() call
 *   - All frames are stitched into one atlas via RenderTexture.draw()
 *   - Frame rectangles are registered manually on the atlas texture
 *
 * Animation keys: p{i}_idle | p{i}_run | p{i}_jump | p{i}_fall | p{i}_land | p{i}_dead
 */
import { PhysicsConfig as PC } from '../systems/PhysicsConfig.js';
import { PlayerController }    from '../systems/PlayerController.js';

const RESPAWN_DELAY = 1600;  // ms
const FW = 48, FH = 56;     // frame size in pixels

const COLORS = [
  { body: 0xee4444, eye: 0xffffff, pupil: 0x220000, ear: 0xcc2222 },  // Red
  { body: 0x4488ee, eye: 0xffffff, pupil: 0x001133, ear: 0x2266cc },  // Blue
  { body: 0x44cc66, eye: 0xffffff, pupil: 0x002211, ear: 0x229944 },  // Green
  { body: 0xeecc22, eye: 0xffffff, pupil: 0x221100, ear: 0xcc9900 },  // Yellow
];

const NAMES       = ['P1', 'P2', 'P3', 'P4'];
const NAME_COLORS = ['#ff6666', '#66aaff', '#66ee88', '#ffdd44'];

// Per-frame squash/stretch and y-offset
const FRAME_PARAMS = [
  { sx: 1.00, sy: 1.00, oy:  0 },  // 0 idle
  { sx: 0.95, sy: 1.05, oy: -2 },  // 1 run-a
  { sx: 1.00, sy: 1.00, oy:  0 },  // 2 run-b
  { sx: 1.05, sy: 0.95, oy:  2 },  // 3 run-c
  { sx: 0.82, sy: 1.20, oy: -5 },  // 4 jump
  { sx: 1.15, sy: 0.85, oy:  4 },  // 5 fall
  { sx: 1.28, sy: 0.72, oy:  9 },  // 6 land
  { sx: 1.10, sy: 0.60, oy: 12 },  // 7 dead
];

export class Player {
  constructor(scene, index, x, y, characterKey = null) {
    this.scene         = scene;
    this.index         = index;
    this.spawnX        = x;
    this.spawnY        = y;
    this.alive         = true;
    this.facingRight   = true;
    this._respawnTimer = 0;
    this._wasOnGround  = false;
    this._stepTimer    = 0;

    // Use selected character or fallback to procedural
    this.characterKey = characterKey || `player_sheet_${index}`;
    
    // For individual frame images, determine the first frame key
    // Format: p{charNum}{frameNum} - e.g., p11 = char1 frame1 (idle)
    const charNum = characterKey ? parseInt(characterKey.replace('char', '')) : null;
    const firstFrameKey = charNum ? `p${charNum}1` : null;
    
    // Check if using individual images
    const useIndividualImages = firstFrameKey && scene.textures.exists(firstFrameKey);
    const textureKey = useIndividualImages ? firstFrameKey : this.characterKey;
    
    // Store base scale - individual images are ~112-160px tall
    // For 50px in-game height: 50/160 ≈ 0.31
    this.baseScale = useIndividualImages ? 0.31 : 1.0;
    this.useIndividualImages = useIndividualImages;
    
    // If using old procedural system, generate it
    if (!characterKey && !scene.textures.exists(this.characterKey)) {
      this._buildSpriteSheet(this.characterKey, index);
    }

    // Create sprite
    this.sprite = scene.physics.add.sprite(x, y, textureKey, 0);
    this.sprite.setCollideWorldBounds(false);
    this.sprite.setMaxVelocity(PC.MAX_RUN_SPEED, PC.MAX_FALL_SPEED);
    this.sprite.setBounce(0, 0);
    
    // Configure individual image sprites
    if (this.useIndividualImages) {
      this.sprite.setScale(this.baseScale);
      
      // Get actual image dimensions
      const texture = scene.textures.get(textureKey);
      const frameWidth = texture.source[0].width;
      const frameHeight = texture.source[0].height;
      
      // Physics body based on actual image size
      const scaledWidth = frameWidth * this.baseScale;
      const scaledHeight = frameHeight * this.baseScale;
      
      // FULL-SIZE BODY for perfect stacking with no overlap
      const bodyWidth = Math.round(scaledWidth * 0.95);
      const bodyHeight = Math.round(scaledHeight * 0.98);
      
      // Center horizontally, align to BOTTOM vertically
      const offsetX = (scaledWidth - bodyWidth) / 2;
      const offsetY = scaledHeight - bodyHeight;
      
      this.sprite.body.setSize(bodyWidth, bodyHeight);
      this.sprite.body.setOffset(offsetX, offsetY);
      
      // Store dimensions for label positioning
      this.spriteHeight = scaledHeight;
    }
    
    this.sprite.setDepth(15);
    this.sprite.playerRef = this;

    // Register animations (use character key for animation prefix)
    if (!characterKey) {
      this._registerAnims(this.characterKey, index);
    }
    
    this._dustEmitter = this._buildDustEmitter();

    this.label = scene.add.text(x, y - 36, NAMES[index], {
      fontSize: '13px', fontFamily: 'Arial',
      color: NAME_COLORS[index], fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 1).setDepth(20);

    this.controller = new PlayerController(this);
  }

  // ── Sprite sheet generation ───────────────────────────────────────────────
  // 1. Draw each frame into its own generateTexture (reliable, no RT issues)
  // 2. Stitch into one atlas RenderTexture using rt.draw(key, x, y)
  // 3. Register frame rects on the atlas

  _buildSpriteSheet(atlasKey, index) {
    const FRAMES = FRAME_PARAMS.length;
    const c      = COLORS[index % COLORS.length];
    const tmpKeys = [];

    for (let f = 0; f < FRAMES; f++) {
      const tmpKey = `__tmp_p${index}_f${f}`;
      tmpKeys.push(tmpKey);

      if (this.scene.textures.exists(tmpKey)) continue;

      const { sx, sy, oy } = FRAME_PARAMS[f];
      const bw = Math.round(FW * 0.62 * sx);
      const bh = Math.round(FH * 0.70 * sy);
      const bx = (FW - bw) / 2;
      const by = FH - bh + oy;

      const g = this.scene.add.graphics();

      // Drop shadow
      g.fillStyle(0x000000, 0.14);
      g.fillEllipse(FW / 2, FH - 2, bw * 0.85, 6);

      // Ears
      g.fillStyle(c.ear, 1);
      g.fillEllipse(bx + bw * 0.18, by - 4, 10, 13);
      g.fillEllipse(bx + bw * 0.82, by - 4, 10, 13);

      // Body
      g.fillStyle(c.body, 1);
      g.fillRoundedRect(bx, by, bw, bh, 8);

      // Belly highlight
      g.fillStyle(0xffffff, 0.18);
      g.fillEllipse(bx + bw / 2, by + bh * 0.58, bw * 0.46, bh * 0.36);

      // Eyes
      const eyeY   = by + bh * 0.27;
      const eyeOff = bw * 0.21;
      g.fillStyle(c.eye, 1);
      g.fillCircle(bx + bw / 2 - eyeOff, eyeY, 5);
      g.fillCircle(bx + bw / 2 + eyeOff, eyeY, 5);
      g.fillStyle(c.pupil, 1);
      g.fillCircle(bx + bw / 2 - eyeOff + 1, eyeY + 1, 2.8);
      g.fillCircle(bx + bw / 2 + eyeOff + 1, eyeY + 1, 2.8);

      // Mouth
      g.lineStyle(2, c.pupil, 0.7);
      if (f === 4 || f === 5) {
        g.strokeCircle(bx + bw / 2, by + bh * 0.56, 3.5);
      } else {
        g.beginPath();
        g.arc(bx + bw / 2, by + bh * 0.52, 4.5, 0.25, Math.PI - 0.25);
        g.strokePath();
      }

      // Legs (run frames 1-3)
      if (f >= 1 && f <= 3) {
        const swing = Math.sin((f - 1) * 2.1) * 6;
        g.fillStyle(c.body, 1);
        g.fillRoundedRect(bx + bw * 0.18 - 4, by + bh - 1, 9, 9 + swing, 3);
        g.fillRoundedRect(bx + bw * 0.72 - 4, by + bh - 1, 9, 9 - swing, 3);
      }

      // Tail (simple curve using lineTo)
      g.lineStyle(3, c.ear, 0.85);
      g.beginPath();
      g.moveTo(bx + bw - 1, by + bh * 0.38);
      g.lineTo(bx + bw + 7, by + bh * 0.28);
      g.lineTo(bx + bw + 5, by + bh * 0.58);
      g.strokePath();

      g.generateTexture(tmpKey, FW, FH);
      g.destroy();
    }

    // Stitch frames into atlas
    const rt = this.scene.add.renderTexture(0, 0, FW * FRAMES, FH);
    rt.setVisible(false);
    for (let f = 0; f < FRAMES; f++) {
      rt.draw(tmpKeys[f], f * FW, 0);
    }
    rt.saveTexture(atlasKey);
    rt.destroy();

    // Register frame rects
    const tex = this.scene.textures.get(atlasKey);
    for (let f = 0; f < FRAMES; f++) {
      tex.add(f, 0, f * FW, 0, FW, FH);
    }

    // Remove temp textures
    for (const k of tmpKeys) this.scene.textures.remove(k);
  }

  // ── Animations ────────────────────────────────────────────────────────────

  _registerAnims(sheetKey, i) {
    const ac = this.scene.anims;
    const p  = `p${i}`;
    const fr = (n) => ({ key: sheetKey, frame: n });

    if (!ac.exists(`${p}_idle`)) ac.create({ key: `${p}_idle`, frames: [fr(0)],                   frameRate: 4,  repeat: -1 });
    if (!ac.exists(`${p}_run`))  ac.create({ key: `${p}_run`,  frames: [fr(1), fr(2), fr(3)],     frameRate: 10, repeat: -1 });
    if (!ac.exists(`${p}_jump`)) ac.create({ key: `${p}_jump`, frames: [fr(4)],                   frameRate: 1,  repeat: 0  });
    if (!ac.exists(`${p}_fall`)) ac.create({ key: `${p}_fall`, frames: [fr(5)],                   frameRate: 1,  repeat: 0  });
    if (!ac.exists(`${p}_land`)) ac.create({ key: `${p}_land`, frames: [fr(6)],                   frameRate: 12, repeat: 0  });
    if (!ac.exists(`${p}_dead`)) ac.create({ key: `${p}_dead`, frames: [fr(7)],                   frameRate: 1,  repeat: 0  });
  }

  // ── Dust particles ────────────────────────────────────────────────────────

  _buildDustEmitter() {
    if (!this.scene.textures.exists('dust_particle')) {
      const g = this.scene.add.graphics();
      g.fillStyle(0xccbbaa, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture('dust_particle', 8, 8);
      g.destroy();
    }
    return this.scene.add.particles(0, 0, 'dust_particle', {
      speed:    { min: 30, max: 80 },      // Faster particles
      angle:    { min: 180, max: 360 },    // Wider spread
      scale:    { start: 0.7, end: 0 },    // Larger particles
      alpha:    { start: 0.75, end: 0 },   // More visible
      lifespan: 350,                        // Longer lasting
      quantity: 0,
      gravityY: 200,                        // Slightly more gravity
      depth:    12,
    });
  }

  // ── Update ────────────────────────────────────────────────────────────────

  update(delta, input) {
    if (!this.alive) {
      this._respawnTimer -= delta;
      if (this._respawnTimer <= 0) this.respawn();
      this._updateLabel();
      return;
    }
    this.controller.update(delta, input);
    this._updateAnimation(delta);
    this._updateLabel();
    this._updateParticles(delta);
  }

  // ── Animation state machine ───────────────────────────────────────────────

  _updateAnimation(delta) {
    const body     = this.sprite.body;
    const onGround = body.blocked.down;
    const vx       = body.velocity.x;
    const vy       = body.velocity.y;
    // Use character key for animations instead of player index
    const animPrefix = this.characterKey.startsWith('player_sheet_') 
      ? `p${this.index}` 
      : this.characterKey;

    this.sprite.setFlipX(!this.facingRight);

    // Landing squash with better effect
    if (onGround && !this._wasOnGround) {
      this.sprite.play(`${animPrefix}_land`, true);
      this.scene.events.emit('player-landed', this.index);
      this._emitDust(8); // More dust on landing
      // Small screen shake on landing
      if (Math.abs(vy) > 400) {
        this.scene.cameras.main.shake(80, 0.003);
      }
    }
    this._wasOnGround = onGround;

    const cur = this.sprite.anims.currentAnim?.key ?? '';
    const isIdle = this.sprite._idleState || false;

    if (!onGround) {
      // Better air state detection
      if (vy < -50  && cur !== `${animPrefix}_jump`) this.sprite.play(`${animPrefix}_jump`, true);
      else if (vy >= -50 && cur !== `${animPrefix}_fall`) this.sprite.play(`${animPrefix}_fall`, true);
      this.sprite._idleState = false;
    } else if (cur !== `${animPrefix}_land` || !this.sprite.anims.isPlaying) {
      // Lower threshold for run animation (feels more responsive)
      if (Math.abs(vx) > 10) {
        if (cur !== `${animPrefix}_run`)  this.sprite.play(`${animPrefix}_run`,  true);
        this.sprite._idleState = false;
      } else {
        // For idle, set texture directly to prevent animation glitching
        if (!isIdle) {
          if (this.useIndividualImages) {
            // For individual images, stop animation and set texture directly
            this.sprite.anims.stop();
            const charNum = parseInt(this.characterKey.replace('char', ''));
            const idleFrameKey = `p${charNum}1`; // Frame 1 = idle
            this.sprite.setTexture(idleFrameKey);
            // Mark as idle by setting a flag instead of fake anim object
            this.sprite._idleState = true;
          } else {
            // For procedural sprites, use animation
            this.sprite.play(`${animPrefix}_idle`, true);
            this.sprite._idleState = false;
          }
        }
      }
    } else {
      // Clear idle state when not idle
      this.sprite._idleState = false;
    }

    // Enhanced squash / stretch (apply to base scale)
    if (!onGround) {
      const tx = vy < 0 ? 0.85 : 1.12;  // More pronounced
      const ty = vy < 0 ? 1.20 : 0.88;  // More pronounced
      this.sprite.scaleX = Phaser.Math.Linear(this.sprite.scaleX, this.baseScale * tx, 0.20);
      this.sprite.scaleY = Phaser.Math.Linear(this.sprite.scaleY, this.baseScale * ty, 0.20);
    } else {
      this.sprite.scaleX = Phaser.Math.Linear(this.sprite.scaleX, this.baseScale, 0.25);
      this.sprite.scaleY = Phaser.Math.Linear(this.sprite.scaleY, this.baseScale, 0.25);
    }
  }

  _updateParticles(delta) {
    const body = this.sprite.body;
    // More frequent dust when running fast
    if (body.blocked.down && Math.abs(body.velocity.x) > 60) {
      this._stepTimer -= delta;
      const interval = Math.abs(body.velocity.x) > 150 ? 90 : 120; // Faster dust when running faster
      if (this._stepTimer <= 0) { 
        this._stepTimer = interval; 
        this._emitDust(3); // More dust particles
      }
    }
    // Position dust at character's feet
    const dustY = this.useIndividualImages ? this.sprite.y : this.sprite.y + 22;
    this._dustEmitter.setPosition(this.sprite.x, dustY);
  }

  _emitDust(count) {
    const dustY = this.useIndividualImages ? this.sprite.y : this.sprite.y + 22;
    this._dustEmitter.setPosition(this.sprite.x, dustY);
    this._dustEmitter.explode(count);
  }

  _updateLabel() {
    // Adjust label position based on sprite type
    let labelY;
    if (this.useIndividualImages) {
      labelY = this.sprite.y - this.spriteHeight - 10;
    } else {
      labelY = this.sprite.y - 30;
    }
    
    this.label.setPosition(this.sprite.x, labelY);
    if (!this.alive) {
      this.label.setText(`${NAMES[this.index]} ${Math.ceil(this._respawnTimer / 1000)}s`).setColor('#ff4444');
    } else {
      this.label.setText(NAMES[this.index]).setColor(NAME_COLORS[this.index]);
    }
  }

  // ── Death / Respawn ───────────────────────────────────────────────────────

  die() {
    if (!this.alive) return;
    this.alive         = false;
    this._respawnTimer = RESPAWN_DELAY;
    this.sprite.body.velocity.set(0, 0);
    this.sprite.setAlpha(0.25);
    const animPrefix = this.characterKey.startsWith('player_sheet_') 
      ? `p${this.index}` 
      : this.characterKey;
    this.sprite.play(`${animPrefix}_dead`, true);
    this._emitDust(12);
    this.scene.events.emit('player-died', this.index);
  }

  respawn() {
    this.alive = true;
    this.sprite.setPosition(this.spawnX, this.spawnY);
    this.sprite.body.velocity.set(0, 0);
    this.sprite.setAlpha(1);
    this.sprite.setScale(this.baseScale, this.baseScale);
    
    // Set to idle texture/animation
    if (this.useIndividualImages) {
      const charNum = parseInt(this.characterKey.replace('char', ''));
      const idleFrameKey = `p${charNum}1`; // Frame 1 = idle
      this.sprite.setTexture(idleFrameKey);
    }
    
    this.scene.events.emit('player-respawned', this.index);
    this.scene.tweens.add({
      targets: this.sprite, alpha: { from: 0.3, to: 1 },
      duration: 500, repeat: 3, yoyo: true,
      onComplete: () => { if (this.sprite?.active) this.sprite.setAlpha(1); },
    });
  }

  destroy() {
    this.sprite.destroy();
    this.label.destroy();
    this._dustEmitter.destroy();
  }
}
