/**
 * CameraController.js
 * Tracks all alive players, centres between them,
 * and dynamically zooms based on their spread.
 */

const LERP        = 0.07;
const ZOOM_MIN    = 0.45;
const ZOOM_MAX    = 1.15;
const ZOOM_PAD    = 220;   // extra padding around spread
const ZOOM_LERP   = 0.04;

export class CameraController {
  /**
   * @param {Phaser.Cameras.Scene2D.Camera} cam
   * @param {number} worldW
   * @param {number} worldH
   */
  constructor(cam, worldW, worldH) {
    this.cam    = cam;
    this.worldW = worldW;
    this.worldH = worldH;
    this._zoom  = ZOOM_MAX;

    cam.setBounds(0, 0, worldW, worldH);
    cam.setZoom(ZOOM_MAX);
  }

  /**
   * @param {import('../objects/Player.js').Player[]} players
   * @param {number} delta  ms
   */
  update(players, delta) {
    const alive = players.filter(p => p.alive);
    if (!alive.length) return;

    // Midpoint
    const cx = alive.reduce((s, p) => s + p.sprite.x, 0) / alive.length;
    const cy = alive.reduce((s, p) => s + p.sprite.y, 0) / alive.length;

    // Lerp scroll
    const W = this.cam.width  / this._zoom;
    const H = this.cam.height / this._zoom;
    const tx = Phaser.Math.Clamp(cx - W / 2, 0, Math.max(0, this.worldW - W));
    const ty = Phaser.Math.Clamp(cy - H / 2, 0, Math.max(0, this.worldH - H));

    this.cam.scrollX = Phaser.Math.Linear(this.cam.scrollX, tx, LERP);
    this.cam.scrollY = Phaser.Math.Linear(this.cam.scrollY, ty, LERP);

    // Dynamic zoom
    let targetZoom = ZOOM_MAX;
    if (alive.length > 1) {
      const xs = alive.map(p => p.sprite.x);
      const ys = alive.map(p => p.sprite.y);
      const spreadX = Math.max(...xs) - Math.min(...xs) + ZOOM_PAD;
      const spreadY = Math.max(...ys) - Math.min(...ys) + ZOOM_PAD;
      const zx = this.cam.width  / spreadX;
      const zy = this.cam.height / spreadY;
      targetZoom = Phaser.Math.Clamp(Math.min(zx, zy), ZOOM_MIN, ZOOM_MAX);
    }

    this._zoom = Phaser.Math.Linear(this._zoom, targetZoom, ZOOM_LERP);
    this.cam.setZoom(this._zoom);
  }
}
