/**
 * Platform.js
 * Static platform tile. Texture generated at boot in PreloadScene.
 * This class is a thin wrapper; actual group management is in LevelManager.
 */
export class Platform {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x  centre x
   * @param {number} y  centre y
   */
  constructor(scene, x, y) {
    this.sprite = scene.physics.add.staticImage(x, y, 'tile_platform');
    this.sprite.setImmovable(true).refreshBody();
  }

  destroy() { this.sprite.destroy(); }
}
