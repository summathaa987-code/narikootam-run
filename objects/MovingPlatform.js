/**
 * MovingPlatform.js
 * Oscillates along x or y axis using a Phaser tween.
 * Physics body is manually synced each frame.
 */
import { PhysicsConfig as PC } from '../systems/PhysicsConfig.js';

const T = PC.TILE_SIZE;

export class MovingPlatform {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x      world centre X
   * @param {number} y      world centre Y
   * @param {number} w      width px
   * @param {number} h      height px
   * @param {object} data   { move_axis, range, speed }
   */
  constructor(scene, x, y, w, h, data) {
    this.scene   = scene;
    this.axis    = data.move_axis ?? 'x';
    this.range   = (data.range ?? 3) * T;
    this.speed   = data.speed ?? 80;
    
    // Track previous position for velocity calculation
    this.prevX = x;
    this.prevY = y;

    const key = `moving_plat_${w}`;
    if (!scene.textures.exists(key)) {
      const g = scene.add.graphics();
      g.fillStyle(0x2255bb, 1);
      g.fillRoundedRect(0, 0, w, h, 6);
      g.fillStyle(0x88aaff, 1);
      g.fillRect(0, 0, w, 5);
      // Direction arrows
      const cx = w / 2, cy = h / 2;
      g.fillStyle(0xffffff, 0.65);
      if (this.axis === 'x') {
        g.fillTriangle(cx-14,cy, cx-6,cy-5, cx-6,cy+5);
        g.fillTriangle(cx+14,cy, cx+6,cy-5, cx+6,cy+5);
      } else {
        g.fillTriangle(cx,cy-10, cx-5,cy-2, cx+5,cy-2);
        g.fillTriangle(cx,cy+10, cx-5,cy+2, cx+5,cy+2);
      }
      g.generateTexture(key, w, h);
      g.destroy();
    }

    this.sprite = scene.physics.add.image(x, y, key);
    this.sprite.setImmovable(true);
    this.sprite.body.allowGravity = false;
    this.sprite.body.pushable = false;
    this.sprite.setDepth(8);

    const dur = (this.range * 2 / this.speed) * 1000;
    const props = this.axis === 'x'
      ? { x: { from: x - this.range, to: x + this.range } }
      : { y: { from: y - this.range, to: y + this.range } };

    scene.tweens.add({
      targets: this.sprite,
      ...props,
      duration: dur,
      ease:     'Sine.easeInOut',
      yoyo:     true,
      repeat:   -1,
    });
  }

  update(delta) {
    // Calculate velocity based on position change
    const deltaSeconds = delta / 1000;
    const vx = (this.sprite.x - this.prevX) / deltaSeconds;
    const vy = (this.sprite.y - this.prevY) / deltaSeconds;
    
    // Set the body velocity so players inherit the movement
    this.sprite.body.setVelocity(vx, vy);
    
    // Update position to match tween
    this.sprite.body.updateFromGameObject();
    
    // Store current position for next frame
    this.prevX = this.sprite.x;
    this.prevY = this.sprite.y;
  }

  destroy() { this.sprite.destroy(); }
}
