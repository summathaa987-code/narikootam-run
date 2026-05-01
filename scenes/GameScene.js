/**
 * GameScene.js – Core gameplay scene.
 *
 * Responsibilities:
 *  - Load level data and build world via LevelManager
 *  - Spawn players via Player class
 *  - Wire all physics collisions and overlaps
 *  - Drive InputManager + PlayerController each frame
 *  - Win / lose detection
 *  - Screen shake on death
 *  - Pause via ESC
 *  - Communicate with UIScene
 */
import { PhysicsConfig as PC } from '../systems/PhysicsConfig.js';
import { InputManager }        from '../systems/InputManager.js';
import { LevelManager }        from '../systems/LevelManager.js';
import { CameraController }    from '../systems/CameraController.js';
import { Player }              from '../objects/Player.js';

export class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }

  // ── Init ──────────────────────────────────────────────────────────────────

  init() {
    this._players      = [];
    this._levelMgr     = null;
    this._camCtrl      = null;
    this._inputMgr     = null;
    this._keyCollected = false;
    this._won          = false;
    this._gameOver     = false;
    this._paused       = false;
  }

  // ── Create ────────────────────────────────────────────────────────────────

  create() {
    this._numPlayers  = this.registry.get('numPlayers')   ?? 2;
    this._levelIndex  = this.registry.get('currentLevel') ?? 1;
    this._soundMgr    = this.registry.get('soundManager');
    this._playerChars = this.registry.get('playerCharacters') ?? [];

    // Load player-specific level (all levels 1-5 are player-specific now)
    const levelKey = `${this._numPlayers}p_level${this._levelIndex}`;
    const levelData = this.cache.json.get(levelKey);
    
    if (!levelData) {
      const fallbackData = this.cache.json.get('1p_level1');
      this._levelMgr = new LevelManager(this, fallbackData);
    } else {
      this._levelMgr = new LevelManager(this, levelData);
    }

    // World bounds (extra height for fall-death detection)
    this.physics.world.setBounds(
      0, 0,
      this._levelMgr.worldW,
      this._levelMgr.worldH + 300
    );

    // Input
    this._inputMgr = new InputManager(this, this._numPlayers);

    // Players
    for (let i = 0; i < this._numPlayers; i++) {
      const sp = this._levelMgr.spawnPoints[i] ??
                 { x: 96 + i * 60, y: this._levelMgr.worldH - 96 };
      const charKey = this._playerChars[i]?.character ?? `char${(i % 10) + 1}`;
      this._players.push(new Player(this, i, sp.x, sp.y, charKey));
    }

    // Camera
    this._camCtrl = new CameraController(
      this.cameras.main,
      this._levelMgr.worldW,
      this._levelMgr.worldH
    );

    // Collisions
    this._setupCollisions();

    // ESC = pause
    this._escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // CTRL+F = fullscreen
    this.input.keyboard.on('keydown', (event) => {
      if (event.ctrlKey && event.key === 'f') {
        event.preventDefault();
        this._toggleFullscreen();
      }
    });

    // Fullscreen button
    this._createFullscreenButton();

    // Player events
    this.events.on('player-jumped',  () => this._soundMgr?.playJump());
    this.events.on('player-landed',  () => this._soundMgr?.playLand());
    this.events.on('player-died',    (i) => {
      this._soundMgr?.playDeath();
      this.cameras.main.shake(220, 0.012);
      this._checkAllDead();
    });

    // Launch UIScene as an overlay (safe to do from within create())
    if (!this.scene.isActive('UIScene')) {
      this.scene.launch('UIScene');
    }

    // Notify UI once it has initialised
    this.time.delayedCall(100, () => this._notifyUI());
  }

  // ── Collisions ────────────────────────────────────────────────────────────

  _setupCollisions() {
    const lm = this._levelMgr;

    for (const p of this._players) {
      // ↔ static platforms
      this.physics.add.collider(p.sprite, lm.platforms);
      // ↔ moving platforms
      this.physics.add.collider(p.sprite, lm.movingPlatforms);
      // ↔ hazards
      this.physics.add.overlap(p.sprite, lm.hazardGroup, () => p.die());
      // ↔ key
      if (lm.key) {
        this.physics.add.overlap(p.sprite, lm.key.sprite, () => {
          if (!lm.key.collected) {
            lm.key.collect();
            this._keyCollected = true;
            lm.door?.unlock(this._soundMgr);
            this._soundMgr?.playPickup();
            this._notifyUI();
          }
        });
      }
      // ↔ door
      if (lm.door) {
        this.physics.add.overlap(p.sprite, lm.door.sprite, () => {
          if (this._keyCollected && lm.door.open) this._checkWin();
        });
      }
    }

    // Player ↔ Player stacking (allow players to stand on each other)
    for (let i = 0; i < this._players.length; i++) {
      for (let j = i + 1; j < this._players.length; j++) {
        this.physics.add.collider(
          this._players[i].sprite, 
          this._players[j].sprite
        );
      }
    }
  }

  // ── Update ────────────────────────────────────────────────────────────────

  update(time, delta) {
    if (this._paused || this._won || this._gameOver) return;

    // Pause
    if (Phaser.Input.Keyboard.JustDown(this._escKey)) {
      this._pauseGame(); return;
    }

    this._inputMgr.update(delta);

    for (let i = 0; i < this._players.length; i++) {
      const p = this._players[i];
      p.update(delta, this._inputMgr.getState(i));
      // Fall off world
      if (p.alive && p.sprite.y > this._levelMgr.worldH + 120) p.die();
    }

    this._levelMgr.update(time, delta);
    this._camCtrl.update(this._players, delta);
    this._updateUIStatus();
  }

  // ── Win / Lose ────────────────────────────────────────────────────────────

  _checkWin() {
    if (this._won) return;
    const alive = this._players.filter(p => p.alive);
    if (!alive.length) return;
    const door = this._levelMgr.door;
    const allIn = alive.every(p =>
      Phaser.Geom.Intersects.RectangleToRectangle(
        p.sprite.getBounds(), door.sprite.getBounds()
      )
    );
    if (!allIn) return;

    this._won = true;
    this._soundMgr?.playWin();
    this.cameras.main.flash(600, 255, 255, 200);

    this.time.delayedCall(900, () => {
      this.scene.stop('UIScene');
      this.scene.stop('GameScene');
      this.scene.start('WinScene');
    });
  }

  _checkAllDead() {
    if (this._gameOver) return;
    if (this._players.every(p => !p.alive)) {
      this._gameOver = true;
      this.time.delayedCall(1400, () => {
        this.scene.stop('UIScene');
        this.scene.stop('GameScene');
        this.scene.start('LoseScene');
      });
    }
  }

  // ── Pause ─────────────────────────────────────────────────────────────────

  _pauseGame() {
    this._paused = true;
    this.scene.pause('GameScene');
    this.scene.launch('PauseScene');
  }

  resumeGame() {
    this._paused = false;
    this.scene.resume('GameScene');
  }

  // ── UI bridge ─────────────────────────────────────────────────────────────

  _notifyUI() {
    const ui = this.scene.get('UIScene');
    if (!ui?.uiReady) return;
    ui.setLevel(this._levelIndex, this._levelMgr.data.name);
    ui.setKeyCollected(this._keyCollected);
  }

  _updateUIStatus() {
    const ui = this.scene.get('UIScene');
    if (!ui?.uiReady) return;
    for (let i = 0; i < this._players.length; i++) {
      const p = this._players[i];
      ui.updatePlayer(i, p.alive, Math.ceil(p._respawnTimer / 1000));
    }
  }

  // ── Shutdown ──────────────────────────────────────────────────────────────

  shutdown() {
    for (const p of this._players) p.destroy();
    this._levelMgr?.destroy();
    this._inputMgr?.destroy();
    this.events.removeAllListeners();
  }

  // ── Fullscreen ────────────────────────────────────────────────────────────

  _createFullscreenButton() {
    const btnX = 1240, btnY = 40;
    const btnSize = 36;
    
    const bg = this.add.graphics().setDepth(200).setScrollFactor(0);
    const draw = (hover) => {
      bg.clear();
      bg.fillStyle(hover ? 0x3a5aaa : 0x2a4a8a, 0.7);
      bg.fillRoundedRect(btnX - btnSize/2, btnY - btnSize/2, btnSize, btnSize, 6);
      bg.lineStyle(2, hover ? 0x88bbff : 0x4466aa, 0.8);
      bg.strokeRoundedRect(btnX - btnSize/2, btnY - btnSize/2, btnSize, btnSize, 6);
    };
    draw(false);

    const icon = this.add.text(btnX, btnY, '⛶', {
      fontSize: '20px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

    const zone = this.add.zone(btnX, btnY, btnSize, btnSize).setInteractive({ useHandCursor: true }).setDepth(202).setScrollFactor(0);
    zone.on('pointerover', () => draw(true));
    zone.on('pointerout', () => draw(false));
    zone.on('pointerdown', () => this._toggleFullscreen());
  }

  _toggleFullscreen() {
    if (this.scale.isFullscreen) {
      this.scale.stopFullscreen();
    } else {
      this.scale.startFullscreen();
    }
  }
}
