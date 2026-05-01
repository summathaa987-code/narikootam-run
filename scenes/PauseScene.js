/**
 * PauseScene.js – Pause overlay launched on top of GameScene.
 */
const W = 1280, H = 720;

export class PauseScene extends Phaser.Scene {
  constructor() { super({ key: 'PauseScene' }); }

  create() {
    // Dim
    this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.58);

    // Panel
    const g = this.add.graphics();
    g.fillStyle(0x0d1a2e, 0.96);
    g.fillRoundedRect(W/2-230, H/2-185, 460, 370, 18);
    g.lineStyle(2, 0x4466aa, 1);
    g.strokeRoundedRect(W/2-230, H/2-185, 460, 370, 18);

    this.add.text(W/2, H/2-130, 'PAUSED', {
      fontSize: '46px', fontFamily: 'Arial Black, Arial',
      color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    this._btn(W/2, H/2-40,  '▶  RESUME',       () => {
      this.scene.get('GameScene')?.resumeGame();
      this.scene.stop('PauseScene');
    });
    this._btn(W/2, H/2+40,  '↺  RESTART LEVEL', () => {
      this.scene.stop('PauseScene');
      this.scene.stop('UIScene');
      this.scene.stop('GameScene');
      this.scene.start('GameScene');
    });
    this._btn(W/2, H/2+120, '⌂  MAIN MENU',    () => {
      this.scene.stop('PauseScene');
      this.scene.stop('UIScene');
      this.scene.stop('GameScene');
      this.scene.start('MenuScene');
    });

    this.input.keyboard.once('keydown-ESC', () => {
      this.scene.get('GameScene')?.resumeGame();
      this.scene.stop('PauseScene');
    });
  }

  _btn(x, y, label, cb) {
    const w = 300, h = 52;
    const bg = this.add.graphics();
    const draw = (h2) => {
      bg.clear();
      bg.fillStyle(h2 ? 0x4477cc : 0x2a4a8a, 1);
      bg.fillRoundedRect(x-w/2, y-h/2, w, h, 11);
      bg.lineStyle(2, h2 ? 0x88bbff : 0x4466aa, 1);
      bg.strokeRoundedRect(x-w/2, y-h/2, w, h, 11);
    };
    draw(false);
    this.add.text(x, y, label, {
      fontSize: '21px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    const z = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
    z.on('pointerover', () => draw(true));
    z.on('pointerout',  () => draw(false));
    z.on('pointerdown', cb);
  }
}
