/**
 * Hazard.js – Spike hazard. Kills players on contact.
 */
import { PhysicsConfig as PC } from '../systems/PhysicsConfig.js';

const T = PC.TILE_SIZE;

export class Hazard {
  constructor(scene, cx, cy) {
    if (!scene.textures.exists('obj_spike')) {
      this._genTexture(scene);
    }
    this.sprite = scene.physics.add.staticImage(cx, cy, 'obj_spike');
    // Shrink hitbox to spike tips
    this.sprite.setSize(T, T * 0.45).setOffset(0, T * 0.1);
    this.sprite.refreshBody();
    this.sprite.setDepth(9);
  }

  _genTexture(scene) {
    const g = scene.add.graphics();
    for (let i = 0; i < 3; i++) {
      const bx = i * (T / 3);
      g.fillStyle(0xdd2222, 1);
      g.fillTriangle(bx, T, bx + T / 3, T, bx + T / 6, T * 0.42);
      g.fillStyle(0xff7777, 1);
      g.fillTriangle(bx + 3, T, bx + T / 3 - 3, T, bx + T / 6, T * 0.52);
    }
    g.generateTexture('obj_spike', T, T);
    g.destroy();
  }

  destroy() { this.sprite.destroy(); }
}
