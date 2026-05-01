/**
 * LevelManager.js
 * Loads a level JSON, builds all physics groups, and exposes
 * platforms, movingPlatforms, hazards, key, door, spawnPoints.
 */
import { PhysicsConfig as PC } from './PhysicsConfig.js';
import { MovingPlatform }      from '../objects/MovingPlatform.js';
import { Key }                 from '../objects/Key.js';
import { Door }                from '../objects/Door.js';
import { Hazard }              from '../objects/Hazard.js';

const T = PC.TILE_SIZE;

export class LevelManager {
  /**
   * @param {Phaser.Scene} scene
   * @param {object}       levelData  parsed JSON
   */
  constructor(scene, levelData) {
    this.scene    = scene;
    this.data     = levelData;  // Use level data as-is (no dynamic adjustment)
    this.worldW   = 0;
    this.worldH   = 0;

    // Physics groups
    this.platforms        = scene.physics.add.staticGroup();
    this.movingPlatforms  = scene.physics.add.group();
    this.hazardGroup      = scene.physics.add.staticGroup();

    // Game objects
    this.key         = null;
    this.door        = null;
    this.spawnPoints = [];   // [{x,y}, ...]
    this._movingObjs = [];   // MovingPlatform instances

    this._build();
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  _build() {
    const grid = this.data.grid;
    const rows = grid.length;
    const cols = Math.max(...grid.map(r => r.length));
    this.worldW = cols * T;
    this.worldH = rows * T;

    this._drawBackground();

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < (grid[r]?.length ?? 0); c++) {
        const ch = grid[r][c];
        const wx = c * T + T / 2;
        const wy = r * T + T / 2;
        switch (ch) {
          case '#': this._addPlatform(wx, wy);  break;
          case 'S': this._addHazard(wx, wy);    break;
          case 'K': this._addKey(wx, wy);       break;
          case 'D': this._addDoor(wx, wy);      break;
          case '1': case '2': case '3': case '4':
            this._addSpawn(parseInt(ch) - 1, wx, wy - T / 2);
            break;
        }
      }
    }

    for (const mp of (this.data.movingPlatforms ?? [])) {
      this._addMovingPlatform(mp);
    }

    // Guarantee 4 spawn points
    while (this.spawnPoints.length < 4) {
      const last = this.spawnPoints.at(-1) ?? { x: T * 2, y: this.worldH - T * 2 };
      this.spawnPoints.push({ x: last.x + T, y: last.y });
    }
    
    // Add invisible boundary walls at map edges
    this._addBoundaryWalls();
  }

  // ── Boundary walls ────────────────────────────────────────────────────────

  _addBoundaryWalls() {
    // Left wall
    const leftWall = this.scene.add.rectangle(0, this.worldH / 2, T, this.worldH, 0x000000, 0);
    this.scene.physics.add.existing(leftWall, true); // true = static
    this.platforms.add(leftWall);
    
    // Right wall
    const rightWall = this.scene.add.rectangle(this.worldW, this.worldH / 2, T, this.worldH, 0x000000, 0);
    this.scene.physics.add.existing(rightWall, true);
    this.platforms.add(rightWall);
  }

  // ── Tile factories ────────────────────────────────────────────────────────

  _addPlatform(cx, cy) {
    const spr = this.platforms.create(cx, cy, 'tile_platform');
    spr.setImmovable(true).refreshBody();
  }

  _addHazard(cx, cy) {
    const h = new Hazard(this.scene, cx, cy);
    this.hazardGroup.add(h.sprite);
  }

  _addKey(cx, cy) {
    // Key position is now adjusted in the level grid itself based on player count
    this.key = new Key(this.scene, cx, cy);
  }

  _addDoor(cx, cy) {
    // Door is 2 tiles tall; cy is the top tile centre
    this.door = new Door(this.scene, cx, cy + T / 2);
  }

  _addSpawn(idx, cx, cy) {
    while (this.spawnPoints.length <= idx) {
      this.spawnPoints.push({ x: cx, y: cy });
    }
    this.spawnPoints[idx] = { x: cx, y: cy };
  }

  _addMovingPlatform(data) {
    const mp = new MovingPlatform(
      this.scene,
      data.x * T + T / 2,
      data.y * T + T / 2,
      data.width * T,
      T,
      data
    );
    this._movingObjs.push(mp);
    this.movingPlatforms.add(mp.sprite);
  }

  // ── Background ────────────────────────────────────────────────────────────

  _drawBackground() {
    const bg  = this.data.bgColor  ?? [10, 10, 20];
    const sky = this.data.skyColor ?? [20, 30, 70];
    const g   = this.scene.add.graphics().setDepth(-20).setScrollFactor(0.15);

    for (let y = 0; y < this.worldH; y += 3) {
      const t  = y / this.worldH;
      const r  = Math.round(sky[0] + (bg[0] - sky[0]) * t);
      const gv = Math.round(sky[1] + (bg[1] - sky[1]) * t);
      const b  = Math.round(sky[2] + (bg[2] - sky[2]) * t);
      g.fillStyle(Phaser.Display.Color.GetColor(r, gv, b), 1);
      g.fillRect(0, y, this.worldW, 3);
    }

    // Stars
    const rng = new Phaser.Math.RandomDataGenerator([`lvl${this.data.name}`]);
    g.fillStyle(0xffffff, 0.55);
    for (let i = 0; i < 80; i++) {
      g.fillCircle(
        rng.integerInRange(0, this.worldW),
        rng.integerInRange(0, this.worldH * 0.55),
        rng.integerInRange(1, 2)
      );
    }
  }

  // ── Update ────────────────────────────────────────────────────────────────

  update(time, delta) {
    for (const mp of this._movingObjs) mp.update(time, delta);
    this.key?.update(time, delta);
    this.door?.update(time, delta);
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────

  destroy() {
    this.platforms.destroy(true);
    this.movingPlatforms.destroy(true);
    this.hazardGroup.destroy(true);
    for (const mp of this._movingObjs) mp.destroy();
    this.key?.destroy();
    this.door?.destroy();
  }
}
