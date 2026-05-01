/**
 * BootScene.js – First scene. Generates all shared textures and
 * transitions immediately to MenuScene.
 */

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // No external assets – everything is procedurally generated.
    // Show a simple loading bar in case of slow connections.
    const W = this.scale.width;
    const H = this.scale.height;

    const bar = this.add.graphics();
    bar.fillStyle(0x333355, 1);
    bar.fillRoundedRect(W / 2 - 160, H / 2 - 12, 320, 24, 6);

    const fill = this.add.graphics();
    this.load.on('progress', (v) => {
      fill.clear();
      fill.fillStyle(0x5599ff, 1);
      fill.fillRoundedRect(W / 2 - 158, H / 2 - 10, 316 * v, 20, 5);
    });

    this.add.text(W / 2, H / 2 - 40, 'Loading…', {
      fontSize:   '20px',
      fontFamily: 'Arial',
      color:      '#aaaacc',
    }).setOrigin(0.5);
  }

  create() {
    this.scene.start('MenuScene');
  }
}
