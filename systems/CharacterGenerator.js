/**
 * CharacterGenerator.js
 * Generates sprite sheets for all characters with fixed face placeholders.
 * Temporary procedural generation - replace with real sprite sheets later.
 */
import { CHARACTERS, FACE_CONFIG, SPRITE_CONFIG } from '../data/CharacterData.js';

const FW = SPRITE_CONFIG.frameWidth;
const FH = SPRITE_CONFIG.frameHeight;
const FRAMES = SPRITE_CONFIG.frameCount;

export class CharacterGenerator {
  /**
   * Generate all character sprite sheets
   */
  static generateAll(scene) {
    for (const char of CHARACTERS) {
      if (!scene.textures.exists(char.key)) {
        this.generateCharacter(scene, char);
      }
    }
  }

  /**
   * Generate a single character sprite sheet
   */
  static generateCharacter(scene, charData) {
    const tmpKeys = [];

    // Frame definitions
    const frameDefs = [
      { sx: 1.0, sy: 1.0, oy: 0, legs: 'idle' },      // 0: IDLE
      { sx: 0.95, sy: 1.05, oy: -2, legs: 'run1' },   // 1: RUN 1
      { sx: 1.05, sy: 0.95, oy: 2, legs: 'run2' },    // 2: RUN 2
      { sx: 0.85, sy: 1.15, oy: -4, legs: 'jump' },   // 3: JUMP
      { sx: 1.1, sy: 0.9, oy: 3, legs: 'fall' },      // 4: FALL
      { sx: 1.15, sy: 0.7, oy: 8, legs: 'land' },     // 5: LAND
      { sx: 0.9, sy: 1.1, oy: -3, legs: 'hurt' },     // 6: HURT
      { sx: 1.3, sy: 0.5, oy: 15, legs: 'dead' },     // 7: DEAD
    ];

    // Generate each frame
    for (let f = 0; f < FRAMES; f++) {
      const tk = `__tmp_${charData.key}_${f}`;
      tmpKeys.push(tk);
      
      const g = scene.add.graphics();
      const def = frameDefs[f];

      // Body dimensions with squash/stretch
      const bodyW = Math.round(24 * def.sx);
      const bodyH = Math.round(36 * def.sy);
      const bodyX = (FW - bodyW) / 2;
      const bodyY = FH - bodyH - 8 + def.oy;

      // Shadow
      g.fillStyle(0x000000, 0.15);
      g.fillEllipse(FW / 2, FH - 3, bodyW * 0.7, 4);

      // Body
      g.fillStyle(charData.bodyColor, 1);
      g.fillRoundedRect(bodyX, bodyY, bodyW, bodyH, 8);

      // Body shading
      g.fillStyle(charData.darkColor, 0.3);
      g.fillRoundedRect(bodyX, bodyY + bodyH * 0.6, bodyW, bodyH * 0.4, 8);

      // Body highlight
      g.fillStyle(charData.lightColor, 0.3);
      g.fillEllipse(bodyX + bodyW / 2, bodyY + bodyH * 0.3, bodyW * 0.5, bodyH * 0.2);

      // Arms
      this._drawArms(g, bodyX, bodyY, bodyW, bodyH, charData, def.legs);

      // Legs
      this._drawLegs(g, bodyX, bodyY, bodyW, bodyH, charData, def.legs);

      // HEAD with FIXED FACE PLACEHOLDER
      const headX = FACE_CONFIG.offsetX;
      const headY = FACE_CONFIG.offsetY;
      
      // Head background
      g.fillStyle(charData.bodyColor, 1);
      g.fillCircle(headX + FACE_CONFIG.width / 2, headY + FACE_CONFIG.height / 2, FACE_CONFIG.width / 2 + 2);

      // FACE PLACEHOLDER - FIXED RECTANGLE
      g.fillStyle(0xffffff, 1);
      g.fillRect(headX, headY, FACE_CONFIG.width, FACE_CONFIG.height);
      
      // Face border
      g.lineStyle(1, 0x000000, 0.2);
      g.strokeRect(headX, headY, FACE_CONFIG.width, FACE_CONFIG.height);

      // Simple placeholder features
      g.fillStyle(0x333333, 0.5);
      g.fillCircle(headX + 6, headY + 8, 2);
      g.fillCircle(headX + 14, headY + 8, 2);
      g.fillRect(headX + 7, headY + 14, 6, 2);

      // Ears
      g.fillStyle(charData.bodyColor, 1);
      g.fillEllipse(headX - 2, headY + FACE_CONFIG.height / 2, 4, 8);
      g.fillEllipse(headX + FACE_CONFIG.width + 2, headY + FACE_CONFIG.height / 2, 4, 8);

      g.generateTexture(tk, FW, FH);
      g.destroy();
    }

    // Stitch into sprite sheet
    const rt = scene.add.renderTexture(0, 0, FW * FRAMES, FH);
    rt.setVisible(false);
    for (let f = 0; f < FRAMES; f++) {
      rt.draw(tmpKeys[f], f * FW, 0);
    }
    rt.saveTexture(charData.key);

    // Add frame data
    const tex = scene.textures.get(charData.key);
    for (let f = 0; f < FRAMES; f++) {
      tex.add(f, 0, f * FW, 0, FW, FH);
    }

    rt.destroy();
    for (const k of tmpKeys) scene.textures.remove(k);
  }

  static _drawArms(g, bx, by, bw, bh, colors, state) {
    const armW = 6, armH = 12;
    g.fillStyle(colors.bodyColor, 1);

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

  static _drawLegs(g, bx, by, bw, bh, colors, state) {
    const legW = 7, legH = 10;
    const legY = by + bh - 2;
    g.fillStyle(colors.darkColor, 1);

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
   * Register animations for a character
   */
  static registerAnimations(scene, charKey) {
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
      const animKey = `${charKey}_${anim.name}`;
      if (!scene.anims.exists(animKey)) {
        scene.anims.create({
          key: animKey,
          frames: anim.frames.map(f => ({ key: charKey, frame: f })),
          frameRate: anim.rate,
          repeat: anim.name === 'idle' || anim.name === 'run' ? -1 : 0,
        });
      }
    }
  }
}
