/**
 * PreloadScene.js
 * Loads all level JSON files, generates shared textures,
 * shows a clean loading bar, then transitions to MenuScene.
 */
import { PhysicsConfig as PC } from '../systems/PhysicsConfig.js';

const T = PC.TILE_SIZE;

export class PreloadScene extends Phaser.Scene {
  constructor() { super({ key: 'PreloadScene' }); }

  preload() {
    const W = this.scale.width;
    const H = this.scale.height;

    // ── Background ────────────────────────────────────────────────────────
    const bg = this.add.graphics();
    bg.fillStyle(0x050510, 1);
    bg.fillRect(0, 0, W, H);

    // ── Logo ──────────────────────────────────────────────────────────────
    this.add.text(W / 2, H / 2 - 110, '🐾', {
      fontSize: '56px',
    }).setOrigin(0.5);

    this.add.text(W / 2, H / 2 - 48, 'NARIKOOTAM RUN!', {
      fontSize:   '44px',
      fontFamily: 'Arial Black, Arial',
      color:      '#ffdd44',
      stroke:     '#aa6600',
      strokeThickness: 5,
    }).setOrigin(0.5);

    // ── Loading bar ───────────────────────────────────────────────────────
    const BAR_W = 360, BAR_H = 20;
    const barX  = W / 2 - BAR_W / 2;
    const barY  = H / 2 + 40;

    // Track background
    const trackGfx = this.add.graphics();
    trackGfx.fillStyle(0x222244, 1);
    trackGfx.fillRoundedRect(barX, barY, BAR_W, BAR_H, 5);
    trackGfx.lineStyle(2, 0x4466aa, 1);
    trackGfx.strokeRoundedRect(barX, barY, BAR_W, BAR_H, 5);

    // Fill bar
    const fillGfx = this.add.graphics();

    // Percentage text — placed BELOW the bar with a gap
    const pct = this.add.text(W / 2, barY + BAR_H + 18, '0%', {
      fontSize:   '14px',
      fontFamily: 'Arial',
      color:      '#8888aa',
    }).setOrigin(0.5, 0);

    this.load.on('progress', (v) => {
      fillGfx.clear();
      fillGfx.fillStyle(0x5599ff, 1);
      fillGfx.fillRoundedRect(barX + 2, barY + 2, (BAR_W - 4) * v, BAR_H - 4, 4);
      pct.setText(`${Math.round(v * 100)}%`);
    });

    // ── Load level JSON files ─────────────────────────────────────────────
    // Load all player-count-specific levels (1-5 for each player count)
    // Format: {playerCount}p_level{levelNum}.json
    for (let players = 1; players <= 4; players++) {
      for (let level = 1; level <= 5; level++) {
        this.load.json(`${players}p_level${level}`, `levels/${players}p_level${level}.json`);
      }
    }
  }

  async create() {
    this._genPlatformTile();
    
    // Load all individual character frame images
    // Format: p{charNum}{frameNum}.png
    // All 10 characters × 7 frames = 70 images
    
    for (let char = 1; char <= 10; char++) {
      for (let frame = 1; frame <= 7; frame++) {
        const key = `p${char}${frame}`;
        const path = `assets/characters/${key}.png`;
        this.load.image(key, path);
      }
    }
    
    this.load.once('complete', () => {
      this._registerIndividualFrameAnimations();
      this.time.delayedCall(350, () => this.scene.start('MenuScene'));
    });
    
    this.load.start();
  }

  _registerIndividualFrameAnimations() {
    const characters = ['char1', 'char2', 'char3', 'char4', 'char5', 'char6', 'char7', 'char8', 'char9', 'char10'];
    
    // Frame mapping: 1=idle, 2=run1, 3=run2, 4=jump, 5=fall, 6=land, 7=dead
    for (let i = 0; i < 10; i++) {
      const charKey = characters[i];
      const charNum = i + 1;
      
      // Create animations using individual image keys
      const anims = [
        { name: 'idle', frames: [`p${charNum}1`], rate: 1, repeat: 0 },
        { name: 'run', frames: [`p${charNum}2`, `p${charNum}3`], rate: 12, repeat: -1 },
        { name: 'jump', frames: [`p${charNum}4`], rate: 1, repeat: 0 },
        { name: 'fall', frames: [`p${charNum}5`], rate: 1, repeat: 0 },
        { name: 'land', frames: [`p${charNum}6`], rate: 15, repeat: 0 },
        { name: 'hurt', frames: [`p${charNum}6`], rate: 1, repeat: 0 },
        { name: 'dead', frames: [`p${charNum}7`], rate: 1, repeat: 0 },
      ];
      
      for (const anim of anims) {
        const animKey = `${charKey}_${anim.name}`;
        if (!this.anims.exists(animKey)) {
          this.anims.create({
            key: animKey,
            frames: anim.frames.map(frameKey => ({ key: frameKey, frame: 0 })),
            frameRate: anim.rate,
            repeat: anim.repeat,
          });
        }
      }
    }
  }

  // ── Platform tile texture ─────────────────────────────────────────────────

  _genPlatformTile() {
    if (this.textures.exists('tile_platform')) return;
    const g = this.add.graphics();

    g.fillStyle(0x3a7a3a, 1);
    g.fillRect(0, 0, T, T);

    // Grass top
    g.fillStyle(0x55bb55, 1);
    g.fillRect(0, 0, T, 6);

    // Highlight
    g.fillStyle(0x77dd77, 0.3);
    g.fillRect(2, 1, T - 4, 3);

    // Grid lines
    g.lineStyle(1, 0x000000, 0.12);
    g.strokeRect(0, 0, T, T);
    g.lineStyle(1, 0x000000, 0.06);
    g.lineBetween(0, T / 2, T, T / 2);

    // Pebbles
    g.fillStyle(0x2a5a2a, 0.45);
    g.fillCircle(T * 0.25, T * 0.65, 3);
    g.fillCircle(T * 0.70, T * 0.75, 2);

    g.generateTexture('tile_platform', T, T);
    g.destroy();
  }
}
