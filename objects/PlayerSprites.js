/**
 * PlayerSprites.js
 * Generates player sprite sheets with FIXED FACE PLACEHOLDER system.
 * Face region is a stable rectangle that can be replaced with real images.
 */
import { PhysicsConfig as PC } from '../systems/PhysicsConfig.js';

const FRAME_W = 48;
const FRAME_H = 60;
const FRAMES = 8;

// Face placeholder dimensions (FIXED across all frames)
const FACE_W = 20;
const FACE_H = 20;
const FACE_OFFSET_X = (FRAME_W - FACE_W) / 2;
const FACE_OFFSET_Y = 8;

// Color schemes for 4 players
const PLAYER_COLORS = [
  { body: 0xee4444, dark: 0xaa2222, light: 0xff8888, name: 'Red' },
  { body: 0x4488ee, dark: 0x2255aa, light: 0x88bbff, name: 'Blue' },
  { body: 0x44cc66, dark: 0x228844, light: 0x88ff99, name: 'Green' },
  { body: 0xeecc22, dark: 0xaa8800, light: 0xffee88, name: 'Yellow' },
];

export class PlayerSprites {
  /**
   * Generate sprite sheet for a player with fixed face placeholder
   * @param {Phaser.Scene} scene
   * @param {number} playerIndex (0-3)
   * @returns {string} texture key
   */
  static generate(scene, playerIndex) {
    const key = `player_sheet_${playerIndex}`;
    if (scene.textures.exists(key)) return key;

    const colors = PLAYER_COLORS[playerIndex];
    const tmpKeys = [];

    // Frame definitions: [scaleX, scaleY, offsetY, bodyTilt, legPhase]
    const frameDefs = [
      // 0: IDLE
      { sx: 1.0, sy: 1.0, oy: 0, tilt: 0, legs: 'idle' },
      // 1: RUN frame 1
      { sx: 0.95, sy: 1.05, oy: -2, tilt: 5, legs: 'run1' },
      // 2: RUN frame 2
      { sx: 1.05, sy: 0.95, oy: 2, tilt: -5, legs: 'run2' },
      // 3: JUMP
      { sx: 0.85, sy: 1.15, oy: -4, tilt: 0, legs: 'jump' },
      // 4: FALL
      { sx: 1.1, sy: 0.9, oy: 3, tilt: 0, legs: 'fall' },
      // 5: LAND
      { sx: 1.15, sy: 0.7, oy: 8, tilt: 0, legs: 'land' },
      // 6: HURT
      { sx: 0.9, sy: 1.1, oy: -3, tilt: 15, legs: 'hurt' },
      // 7: DEAD
      { sx: 1.3, sy: 0.5, oy: 15, tilt: 90, legs: 'dead' },
    ];

    // Generate each frame
    for (let f = 0; f < FRAMES; f++) {
      const tk = `__ptmp_${playerIndex}_${f}`;
      tmpKeys.push(tk);
      
      const g = scene.add.graphics();
      const def = frameDefs[f];

      // Calculate body dimensions with squash/stretch
      const bodyW = Math.round(24 * def.sx);
      const bodyH = Math.round(36 * def.sy);
      const bodyX = (FRAME_W - bodyW) / 2;
      const bodyY = FRAME_H - bodyH - 8 + def.oy;

      // Shadow
      g.fillStyle(0x000000, 0.15);
      g.fillEllipse(FRAME_W / 2, FRAME_H - 3, bodyW * 0.7, 4);

      // Body (rounded rectangle)
      g.fillStyle(colors.body, 1);
      g.fillRoundedRect(bodyX, bodyY, bodyW, bodyH, 8);

      // Body shading
      g.fillStyle(colors.dark, 0.2);
      g.fillRoundedRect(bodyX, bodyY + bodyH * 0.6, bodyW, bodyH * 0.4, 8);

      // Body highlight
      g.fillStyle(colors.light, 0.25);
      g.fillEllipse(bodyX + bodyW / 2, bodyY + bodyH * 0.3, bodyW * 0.5, bodyH * 0.2);

      // Arms (simple stubs)
      this._drawArms(g, bodyX, bodyY, bodyW, bodyH, colors, def.legs);

      // Legs
      this._drawLegs(g, bodyX, bodyY, bodyW, bodyH, colors, def.legs);

      // HEAD with FIXED FACE PLACEHOLDER
      const headX = FACE_OFFSET_X;
      const headY = FACE_OFFSET_Y;
      
      // Head background (behind face)
      g.fillStyle(colors.body, 1);
      g.fillCircle(headX + FACE_W / 2, headY + FACE_H / 2, FACE_W / 2 + 2);

      // FACE PLACEHOLDER - FIXED RECTANGLE (this is where real face goes)
      g.fillStyle(0xffffff, 1);
      g.fillRect(headX, headY, FACE_W, FACE_H);
      
      // Face border (for visibility during development)
      g.lineStyle(1, 0x000000, 0.3);
      g.strokeRect(headX, headY, FACE_W, FACE_H);

      // Simple placeholder features (will be replaced)
      g.fillStyle(0x333333, 0.4);
      g.fillCircle(headX + 6, headY + 8, 2);  // left eye
      g.fillCircle(headX + 14, headY + 8, 2); // right eye
      g.fillRect(headX + 7, headY + 14, 6, 2); // mouth

      // Ears (outside face region)
      g.fillStyle(colors.body, 1);
      g.fillEllipse(headX - 2, headY + FACE_H / 2, 4, 8);
      g.fillEllipse(headX + FACE_W + 2, headY + FACE_H / 2, 4, 8);

      g.generateTexture(tk, FRAME_W, FRAME_H);
      g.destroy();
    }

    // Stitch frames into sprite sheet
    const rt = scene.add.renderTexture(0, 0, FRAME_W * FRAMES, FRAME_H);
    rt.setVisible(false);
    for (let f = 0; f < FRAMES; f++) {
      rt.draw(tmpKeys[f], f * FRAME_W, 0);
    }
    rt.saveTexture(key);

    // Add frame data
    const tex = scene.textures.get(key);
    for (let f = 0; f < FRAMES; f++) {
      tex.add(f, 0, f * FRAME_W, 0, FRAME_W, FRAME_H);
    }

    rt.destroy();
    for (const k of tmpKeys) scene.textures.remove(k);

    return key;
  }

  /**
   * Draw arms based on animation state
   */
  static _drawArms(g, bx, by, bw, bh, colors, state) {
    const armW = 6, armH = 12;
    g.fillStyle(colors.body, 1);

    switch (state) {
      case 'run1':
        g.fillRoundedRect(bx - 3, by + 8, armW, armH, 3);
        g.fillRoundedRect(bx + bw - 3, by + 12, armW, armH, 3);
        break;
      case 'run2':
        g.fillRoundedRect(bx - 3, by + 12, armW, armH, 3);
        g.fillRoundedRect(bx + bw - 3, by + 8, armW, armH, 3);
        break;
      case 'jump':
        g.fillRoundedRect(bx - 4, by + 4, armW, armH, 3);
        g.fillRoundedRect(bx + bw - 2, by + 4, armW, armH, 3);
        break;
      default:
        g.fillRoundedRect(bx - 2, by + 10, armW, armH, 3);
        g.fillRoundedRect(bx + bw - 4, by + 10, armW, armH, 3);
    }
  }

  /**
   * Draw legs based on animation state
   */
  static _drawLegs(g, bx, by, bw, bh, colors, state) {
    const legW = 7, legH = 10;
    const legY = by + bh - 2;
    g.fillStyle(colors.dark, 1);

    switch (state) {
      case 'run1':
        g.fillRoundedRect(bx + 4, legY, legW, legH + 3, 3);
        g.fillRoundedRect(bx + bw - 11, legY, legW, legH - 3, 3);
        break;
      case 'run2':
        g.fillRoundedRect(bx + 4, legY, legW, legH - 3, 3);
        g.fillRoundedRect(bx + bw - 11, legY, legW, legH + 3, 3);
        break;
      case 'jump':
        g.fillRoundedRect(bx + 4, legY - 2, legW, legH - 4, 3);
        g.fillRoundedRect(bx + bw - 11, legY - 2, legW, legH - 4, 3);
        break;
      case 'fall':
        g.fillRoundedRect(bx + 4, legY + 2, legW, legH + 2, 3);
        g.fillRoundedRect(bx + bw - 11, legY + 2, legW, legH + 2, 3);
        break;
      case 'land':
        g.fillRoundedRect(bx + 4, legY + 4, legW, legH - 2, 3);
        g.fillRoundedRect(bx + bw - 11, legY + 4, legW, legH - 2, 3);
        break;
      case 'dead':
        g.fillRoundedRect(bx + bw / 2 - 10, legY + 8, legW, 4, 2);
        g.fillRoundedRect(bx + bw / 2 + 3, legY + 8, legW, 4, 2);
        break;
      default:
        g.fillRoundedRect(bx + 5, legY, legW, legH, 3);
        g.fillRoundedRect(bx + bw - 12, legY, legW, legH, 3);
    }
  }

  /**
   * Get face placeholder region for a given player
   * Use this to overlay real face images
   */
  static getFacePlaceholder() {
    return {
      x: FACE_OFFSET_X,
      y: FACE_OFFSET_Y,
      width: FACE_W,
      height: FACE_H,
      frameWidth: FRAME_W,
      frameHeight: FRAME_H,
    };
  }

  /**
   * Register animations for a player
   */
  static registerAnimations(scene, playerIndex) {
    const key = `player_sheet_${playerIndex}`;
    const prefix = `p${playerIndex}`;

    const anims = [
      { name: 'idle', frames: [0], rate: 4 },
      { name: 'run', frames: [1, 2], rate: 10 },
      { name: 'jump', frames: [3], rate: 1 },
      { name: 'fall', frames: [4], rate: 1 },
      { name: 'land', frames: [5], rate: 1 },
      { name: 'hurt', frames: [6], rate: 1 },
      { name: 'dead', frames: [7], rate: 1 },
    ];

    for (const anim of anims) {
      const animKey = `${prefix}_${anim.name}`;
      if (!scene.anims.exists(animKey)) {
        scene.anims.create({
          key: animKey,
          frames: anim.frames.map(f => ({ key, frame: f })),
          frameRate: anim.rate,
          repeat: anim.name === 'idle' || anim.name === 'run' ? -1 : 0,
        });
      }
    }
  }
}
