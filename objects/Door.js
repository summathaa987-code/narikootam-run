/**
 * Door.js – Exit door. Locked (red) → open (green) with slide animation.
 */
import { PhysicsConfig as PC } from '../systems/PhysicsConfig.js';

const T = PC.TILE_SIZE;

export class Door {
  constructor(scene, x, y) {
    this.scene = scene;
    this.open  = false;
    this._x    = x;
    this._y    = y;

    if (!scene.textures.exists('door_locked')) this._genTextures();

    // Frame decoration
    const gf = scene.add.graphics().setDepth(6);
    gf.fillStyle(0x442200, 1);
    gf.fillRoundedRect(x - T / 2 - 6, y - T - 6, T + 12, T * 2 + 12, 4);

    // Door panel
    this.sprite = scene.physics.add.sprite(x, y, 'door_locked');
    this.sprite.body.allowGravity = false;
    this.sprite.setImmovable(true);
    this.sprite.setDepth(7);

    // Lock icon
    this._lock = scene.add.text(x, y - 4, '🔒', { fontSize: '22px' })
      .setOrigin(0.5).setDepth(16);

    // EXIT label (hidden until open)
    this._exitLabel = scene.add.text(x, y - T - 14, 'EXIT', {
      fontSize: '14px', fontFamily: 'Arial',
      color: '#ffffff', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 1).setDepth(16).setVisible(false);
  }

  _genTextures() {
    const g = this.scene.add.graphics();
    const draw = (color) => {
      g.clear();
      g.fillStyle(color, 1);
      g.fillRoundedRect(0, 0, T, T * 2, 7);
      g.lineStyle(2, 0x000000, 0.25);
      g.strokeRect(4, 4, T - 8, T - 8);
      g.strokeRect(4, T + 4, T - 8, T - 8);
      g.fillStyle(0xffdd00, 1);
      g.fillCircle(T - 10, T, 5);
    };
    draw(0x993333); g.generateTexture('door_locked', T, T * 2);
    draw(0x33aa33); g.generateTexture('door_open',   T, T * 2);
    g.destroy();
  }

  unlock(soundMgr) {
    if (this.open) return;
    this.open = true;
    this.sprite.setTexture('door_open');
    this._lock.setVisible(false);
    this._exitLabel.setVisible(true);

    this.scene.tweens.add({
      targets: this.sprite,
      y: this._y - T * 0.8,
      alpha: 0.55,
      duration: 550,
      ease: 'Quad.easeOut',
    });

    soundMgr?.playDoor();
  }

  update() {}

  destroy() {
    this.sprite.destroy();
    this._lock.destroy();
    this._exitLabel.destroy();
  }
}
