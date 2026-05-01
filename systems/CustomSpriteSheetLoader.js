/**
 * CustomSpriteSheetLoader.js
 * Manually defines frame positions for non-uniform sprite sheets.
 * Each character has individually positioned frames based on actual content.
 */

export class CustomSpriteSheetLoader {
  /**
   * Load sprite sheet with custom frame definitions
   * @param {Phaser.Scene} scene 
   */
  static loadCustomFrames(scene) {
    // Load the image first (without spritesheet parsing)
    scene.load.image('all_characters_raw', 'assets/characters/all_characters.png');
    
    scene.load.once('complete', () => {
      CustomSpriteSheetLoader.defineFrames(scene);
    });
  }

  /**
   * Define individual frames for each character
   * Based on frame_analysis.json data
   */
  static defineFrames(scene) {
    const texture = scene.textures.get('all_characters_raw');
    
    // Character frame definitions
    // Each character has 8 frames (idle, run1, run2, jump, fall, land, hurt, dead)
    const characters = [
      {
        name: 'char1',
        row: 0,
        frames: [
          { x: 0, y: 0, w: 143, h: 204 },      // Frame 0: idle
          { x: 143, y: 0, w: 143, h: 204 },    // Frame 1: run1
          { x: 286, y: 0, w: 143, h: 204 },    // Frame 2: run2
          { x: 429, y: 0, w: 143, h: 204 },    // Frame 3: jump
          { x: 572, y: 0, w: 144, h: 204 },    // Frame 4: fall
          { x: 716, y: 0, w: 143, h: 204 },    // Frame 5: land
          { x: 859, y: 0, w: 143, h: 204 },    // Frame 6: hurt
          { x: 1002, y: 0, w: 143, h: 204 },   // Frame 7: dead
        ]
      },
      {
        name: 'char2',
        row: 1,
        frames: [
          { x: 0, y: 204, w: 143, h: 205 },
          { x: 143, y: 204, w: 143, h: 205 },
          { x: 286, y: 204, w: 143, h: 205 },
          { x: 429, y: 204, w: 143, h: 205 },
          { x: 572, y: 204, w: 144, h: 205 },
          { x: 716, y: 204, w: 143, h: 205 },
          { x: 859, y: 204, w: 143, h: 205 },
          { x: 1002, y: 204, w: 143, h: 205 },
        ]
      },
      {
        name: 'char3',
        row: 2,
        frames: [
          { x: 0, y: 409, w: 143, h: 205 },
          { x: 143, y: 409, w: 143, h: 205 },
          { x: 286, y: 409, w: 143, h: 205 },
          { x: 429, y: 409, w: 143, h: 205 },
          { x: 572, y: 409, w: 144, h: 205 },
          { x: 716, y: 409, w: 143, h: 205 },
          { x: 859, y: 409, w: 143, h: 205 },
          { x: 1002, y: 409, w: 143, h: 205 },
        ]
      },
      {
        name: 'char4',
        row: 3,
        frames: [
          { x: 0, y: 614, w: 143, h: 205 },
          { x: 143, y: 614, w: 143, h: 205 },
          { x: 286, y: 614, w: 143, h: 205 },
          { x: 429, y: 614, w: 143, h: 205 },
          { x: 572, y: 614, w: 144, h: 205 },
          { x: 716, y: 614, w: 143, h: 205 },
          { x: 859, y: 614, w: 143, h: 205 },
          { x: 1002, y: 614, w: 143, h: 205 },
        ]
      },
      {
        name: 'char5',
        row: 4,
        frames: [
          { x: 0, y: 819, w: 143, h: 205 },
          { x: 143, y: 819, w: 143, h: 205 },
          { x: 286, y: 819, w: 143, h: 205 },
          { x: 429, y: 819, w: 143, h: 205 },
          { x: 572, y: 819, w: 144, h: 205 },
          { x: 716, y: 819, w: 143, h: 205 },
          { x: 859, y: 819, w: 143, h: 205 },
          { x: 1002, y: 819, w: 143, h: 205 },
        ]
      },
      {
        name: 'char6',
        row: 5,
        frames: [
          { x: 0, y: 1024, w: 143, h: 204 },
          { x: 143, y: 1024, w: 143, h: 204 },
          { x: 286, y: 1024, w: 143, h: 204 },
          { x: 429, y: 1024, w: 143, h: 204 },
          { x: 572, y: 1024, w: 144, h: 204 },
          { x: 716, y: 1024, w: 143, h: 204 },
          { x: 859, y: 1024, w: 143, h: 204 },
          { x: 1002, y: 1024, w: 143, h: 204 },
        ]
      },
      {
        name: 'char7',
        row: 6,
        frames: [
          { x: 0, y: 1228, w: 143, h: 205 },
          { x: 143, y: 1228, w: 143, h: 205 },
          { x: 286, y: 1228, w: 143, h: 205 },
          { x: 429, y: 1228, w: 143, h: 205 },
          { x: 572, y: 1228, w: 144, h: 205 },
          { x: 716, y: 1228, w: 143, h: 205 },
          { x: 859, y: 1228, w: 143, h: 205 },
          { x: 1002, y: 1228, w: 143, h: 205 },
        ]
      },
      {
        name: 'char8',
        row: 7,
        frames: [
          { x: 0, y: 1433, w: 143, h: 205 },
          { x: 143, y: 1433, w: 143, h: 205 },
          { x: 286, y: 1433, w: 143, h: 205 },
          { x: 429, y: 1433, w: 143, h: 205 },
          { x: 572, y: 1433, w: 144, h: 205 },
          { x: 716, y: 1433, w: 143, h: 205 },
          { x: 859, y: 1433, w: 143, h: 205 },
          { x: 1002, y: 1433, w: 143, h: 205 },
        ]
      },
      {
        name: 'char9',
        row: 8,
        frames: [
          { x: 0, y: 1638, w: 143, h: 205 },
          { x: 143, y: 1638, w: 143, h: 205 },
          { x: 286, y: 1638, w: 143, h: 205 },
          { x: 429, y: 1638, w: 143, h: 205 },
          { x: 572, y: 1638, w: 144, h: 205 },
          { x: 716, y: 1638, w: 143, h: 205 },
          { x: 859, y: 1638, w: 143, h: 205 },
          { x: 1002, y: 1638, w: 143, h: 205 },
        ]
      },
      {
        name: 'char10',
        row: 9,
        frames: [
          { x: 0, y: 1843, w: 143, h: 205 },
          { x: 143, y: 1843, w: 143, h: 205 },
          { x: 286, y: 1843, w: 143, h: 205 },
          { x: 429, y: 1843, w: 143, h: 205 },
          { x: 572, y: 1843, w: 144, h: 205 },
          { x: 716, y: 1843, w: 143, h: 205 },
          { x: 859, y: 1843, w: 143, h: 205 },
          { x: 1002, y: 1843, w: 143, h: 205 },
        ]
      },
    ];

    // Add frames to texture for each character
    for (const char of characters) {
      for (let i = 0; i < char.frames.length; i++) {
        const frame = char.frames[i];
        const frameName = `${char.name}_f${i}`;
        
        // Add frame to texture
        texture.add(frameName, 0, frame.x, frame.y, frame.w, frame.h);
      }
    }
  }

  /**
   * Register animations for a character using custom frames
   */
  static registerAnimations(scene, charKey) {
    const anims = scene.anims;
    
    // Animation definitions
    const animDefs = [
      { name: 'idle', frames: [0], rate: 4, repeat: -1 },
      { name: 'run', frames: [1, 2], rate: 10, repeat: -1 },
      { name: 'jump', frames: [3], rate: 1, repeat: 0 },
      { name: 'fall', frames: [4], rate: 1, repeat: 0 },
      { name: 'land', frames: [5], rate: 1, repeat: 0 },
      { name: 'hurt', frames: [6], rate: 1, repeat: 0 },
      { name: 'dead', frames: [7], rate: 1, repeat: 0 },
    ];

    for (const animDef of animDefs) {
      const animKey = `${charKey}_${animDef.name}`;
      
      if (!anims.exists(animKey)) {
        const frameNames = animDef.frames.map(f => `${charKey}_f${f}`);
        
        anims.create({
          key: animKey,
          frames: frameNames.map(name => ({ key: 'all_characters_raw', frame: name })),
          frameRate: animDef.rate,
          repeat: animDef.repeat,
        });
      }
    }
  }
}
