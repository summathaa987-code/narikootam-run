/**
 * SpriteSheetLoader.js
 * Loads external sprite sheets with multi-row animation format.
 * Handles sprite sheets where each character has multiple animation rows.
 */

export class SpriteSheetLoader {
  /**
   * Load a multi-row sprite sheet for a character
   * @param {Phaser.Scene} scene
   * @param {string} key - Character key (e.g., 'char1')
   * @param {string} path - Path to sprite sheet image
   * @param {object} config - Frame configuration
   */
  static load(scene, key, path, config = {}) {
    const frameWidth = config.frameWidth || 32;
    const frameHeight = config.frameHeight || 32;
    const framesPerRow = config.framesPerRow || 5;
    
    scene.load.spritesheet(key, path, {
      frameWidth: frameWidth,
      frameHeight: frameHeight,
    });
  }

  /**
   * Register animations for a multi-row sprite sheet
   * Assumes rows are: IDLE, RUN, JUMP, FALL, LAND, PUSH, HURT, DIE
   */
  static registerAnimations(scene, charKey, config = {}) {
    const framesPerRow = config.framesPerRow || 5;
    const startFrame = config.startFrame || 0;
    
    // Animation definitions: [rowIndex, frameCount, frameRate]
    const animDefs = [
      { name: 'idle', row: 0, frames: framesPerRow, rate: 8 },
      { name: 'run',  row: 1, frames: framesPerRow, rate: 10 },
      { name: 'jump', row: 2, frames: framesPerRow, rate: 10 },
      { name: 'fall', row: 3, frames: framesPerRow, rate: 10 },
      { name: 'land', row: 4, frames: framesPerRow, rate: 10 },
      { name: 'push', row: 5, frames: framesPerRow, rate: 8 },
      { name: 'hurt', row: 6, frames: framesPerRow, rate: 8 },
      { name: 'dead', row: 7, frames: framesPerRow, rate: 8 },
    ];

    for (const anim of animDefs) {
      const animKey = `${charKey}_${anim.name}`;
      if (!scene.anims.exists(animKey)) {
        const frameStart = startFrame + (anim.row * framesPerRow);
        const frames = [];
        for (let i = 0; i < anim.frames; i++) {
          frames.push(frameStart + i);
        }
        
        scene.anims.create({
          key: animKey,
          frames: scene.anims.generateFrameNumbers(charKey, { frames }),
          frameRate: anim.rate,
          repeat: anim.name === 'idle' || anim.name === 'run' ? -1 : 0,
        });
      }
    }
  }

  /**
   * Get frame configuration for a specific character in a combined sheet
   * Use this if all 10 characters are in one image file
   */
  static getCharacterFrameConfig(characterIndex, config = {}) {
    const framesPerRow = config.framesPerRow || 5;
    const rowsPerChar = config.rowsPerChar || 8;
    const totalRows = config.totalRows || 80; // 10 chars × 8 rows
    const cols = config.cols || 5; // characters per row in the sheet
    
    const charRow = Math.floor(characterIndex / cols);
    const charCol = characterIndex % cols;
    
    return {
      startFrame: (charRow * rowsPerChar * framesPerRow * cols) + (charCol * framesPerRow),
      framesPerRow: framesPerRow,
    };
  }
}
