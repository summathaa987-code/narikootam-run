/**
 * Key.js – Animated collectible key with bob + glow.
 */
export class Key {
  constructor(scene, x, y) {
    this.scene     = scene;
    this.collected = false;

    if (!scene.textures.exists('obj_key')) {
      this._genTexture();
    }

    this.sprite = scene.physics.add.sprite(x, y, 'obj_key');
    this.sprite.body.allowGravity = false;
    this.sprite.setDepth(10);

    // Bob
    scene.tweens.add({
      targets: this.sprite, y: y - 10,
      duration: 850, ease: 'Sine.easeInOut', yoyo: true, repeat: -1,
    });
    // Glow pulse
    scene.tweens.add({
      targets: this.sprite, alpha: 0.65,
      duration: 600, ease: 'Sine.easeInOut', yoyo: true, repeat: -1,
    });

    // Sparkle emitter
    if (!scene.textures.exists('sparkle')) {
      const g = scene.add.graphics();
      g.fillStyle(0xffee44, 1);
      g.fillCircle(6, 6, 4);
      g.generateTexture('sparkle', 12, 12);
      g.destroy();
    }
    this._sparkles = scene.add.particles(x, y, 'sparkle', {
      speed: { min: 15, max: 40 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.9, end: 0 },
      lifespan: 700,
      quantity: 1,
      frequency: 300,
      depth: 9,
    });
  }

  _genTexture() {
    const g = this.scene.add.graphics();
    // Ring
    g.fillStyle(0xffdd00, 1);
    g.fillCircle(14, 14, 12);
    g.fillStyle(0xaa8800, 1);
    g.fillCircle(14, 14, 7);
    g.fillStyle(0xffdd00, 1);
    g.fillCircle(14, 14, 4);
    // Shaft
    g.fillRect(20, 10, 7, 22);
    // Teeth
    g.fillRect(27, 14, 6, 4);
    g.fillRect(27, 22, 6, 4);
    g.generateTexture('obj_key', 38, 38);
    g.destroy();
  }

  update(time) {
    this._sparkles.setPosition(this.sprite.x, this.sprite.y);
  }

  collect() {
    if (this.collected) return;
    this.collected = true;
    this._sparkles.destroy();
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 2.2, scaleY: 2.2, alpha: 0,
      duration: 380, ease: 'Quad.easeOut',
      onComplete: () => this.sprite.setVisible(false),
    });
  }

  destroy() {
    this._sparkles?.destroy();
    this.sprite.destroy();
  }
}
