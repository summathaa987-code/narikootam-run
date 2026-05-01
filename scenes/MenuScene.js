/**
 * MenuScene.js
 * Animated main menu with player count selection (2–4).
 * Initialises SoundManager and stores it in the registry.
 */
import { SoundManager } from '../systems/SoundManager.js';

const W = 1280, H = 720;

export class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  create() {
    // Sound manager (shared across scenes via registry)
    if (!this.registry.get('soundManager')) {
      this.registry.set('soundManager', new SoundManager(this));
    }

    this._selectedPlayers = 2;
    this._time = 0;

    // Animated starfield
    this._stars = this._buildStars();
    this._starGfx = this.add.graphics().setDepth(0);

    // Title
    this._title = this.add.text(W / 2, 120, 'NARIKOOTAM RUN!', {
      fontSize: '76px', fontFamily: 'Arial Black, Arial',
      color: '#ffdd44', stroke: '#aa6600', strokeThickness: 7,
    }).setOrigin(0.5).setDepth(5);

    this.tweens.add({
      targets: this._title, scaleX: 1.04, scaleY: 1.04,
      duration: 950, ease: 'Sine.easeInOut', yoyo: true, repeat: -1,
    });

    this.add.text(W / 2, 210, 'Co-op Puzzle Platformer', {
      fontSize: '24px', fontFamily: 'Arial', color: '#8888aa',
    }).setOrigin(0.5).setDepth(5);

    // Player colour dots
    const cols = [0xee4444, 0x4488ee, 0x44cc66, 0xeecc22];
    const names = ['Red', 'Blue', 'Green', 'Yellow'];
    cols.forEach((c, i) => {
      const g = this.add.graphics().setDepth(5);
      g.fillStyle(c, 1);
      g.fillCircle(W / 2 - 90 + i * 60, 268, 16);
      this.add.text(W / 2 - 90 + i * 60, 290, names[i], {
        fontSize: '11px', fontFamily: 'Arial', color: '#aaaacc',
      }).setOrigin(0.5).setDepth(5);
    });

    // Controls hint
    this.add.text(W / 2, 325, '1P: ← ↑ →  |  2P: A W D, ← ↑ →  |  3P: A W D, ← ↑ →, J I L  |  4P: A W D, ← ↑ →, J I L, F T H', {
      fontSize: '14px', fontFamily: 'Arial', color: '#666688',
    }).setOrigin(0.5).setDepth(5);

    this.add.text(W / 2, 352, 'Collect the key  →  unlock the door  →  reach the exit TOGETHER!', {
      fontSize: '15px', fontFamily: 'Arial', color: '#555577',
    }).setOrigin(0.5).setDepth(5);

    // Player count selector
    this.add.text(W / 2, 400, 'Number of Players', {
      fontSize: '22px', fontFamily: 'Arial', color: '#aaaacc', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(5);

    this._playerBtns = [];
    [1, 2, 3, 4].forEach((n, i) => {
      const btn = this._makeSmallButton(W / 2 - 180 + i * 120, 448, `${n} Player${n > 1 ? 's' : ''}`, () => {
        this._selectedPlayers = n;
        this._refreshPlayerBtns(i);
      });
      this._playerBtns.push(btn);
    });
    this._refreshPlayerBtns(1); // Default to 2 players

    // START button
    // NOTE: only call scene.start() here — GameScene.create() launches UIScene
    const startBtn = this._makeButton(W / 2, 530, '▶  START GAME', () => {
      const sm = this.registry.get('soundManager');
      if (sm) sm.startMusic();
      this.registry.set('numPlayers',   this._selectedPlayers);
      this.registry.set('currentLevel', 1);
      this.scene.start('CharacterSelectScene');
    });

    this.add.text(W / 2, 618, 'ESC to pause  |  CTRL+F to toggle fullscreen', {
      fontSize: '13px', fontFamily: 'Arial', color: '#333344',
    }).setOrigin(0.5).setDepth(5);

    // Fullscreen button (top-right corner)
    this._createFullscreenButton();

    // Start audio on first interaction
    const startAudio = () => {
      this.registry.get('soundManager')?.startMusic();
    };
    this.input.once('pointerdown', startAudio);
    this.input.keyboard.once('keydown', startAudio);

    // CTRL+F = fullscreen
    this.input.keyboard.on('keydown', (event) => {
      if (event.ctrlKey && event.key === 'f') {
        event.preventDefault();
        this._toggleFullscreen();
      }
    });
  }

  update(time) {
    this._time = time;
    const g = this._starGfx;
    g.clear();
    // Draw stars ONLY - no background fill that covers buttons
    for (const s of this._stars) {
      const a = 0.35 + 0.65 * Math.abs(Math.sin(time * 0.001 * s.speed + s.phase));
      g.fillStyle(0xffffff, a);
      g.fillCircle(s.x, s.y, s.r);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  _buildStars() {
    const rng = new Phaser.Math.RandomDataGenerator(['menu42']);
    return Array.from({ length: 110 }, () => ({
      x:     rng.integerInRange(0, W),
      y:     rng.integerInRange(0, H),
      r:     rng.integerInRange(1, 2),
      speed: rng.realInRange(0.4, 2.2),
      phase: rng.realInRange(0, Math.PI * 2),
    }));
  }

  _makeButton(x, y, label, cb) {
    const w = 290, h = 54;
    const bg = this.add.graphics().setDepth(6);
    const draw = (hov) => {
      bg.clear();
      bg.fillStyle(hov ? 0x4477cc : 0x2a4a8a, 1);
      bg.fillRoundedRect(x - w/2, y - h/2, w, h, 11);
      bg.lineStyle(2, hov ? 0x88bbff : 0x4466aa, 1);
      bg.strokeRoundedRect(x - w/2, y - h/2, w, h, 11);
    };
    draw(false);
    this.add.text(x, y, label, {
      fontSize: '22px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(7);
    const z = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true }).setDepth(100);
    z.on('pointerover', () => draw(true));
    z.on('pointerout',  () => draw(false));
    z.on('pointerdown', () => {
      cb();
    });
    return z;
  }

  _makeSmallButton(x, y, label, cb) {
    const w = 110, h = 42;
    const bg = this.add.graphics().setDepth(6);
    const draw = (active, hov) => {
      bg.clear();
      bg.fillStyle(active ? 0x5599ff : (hov ? 0x3a5aaa : 0x2a4a8a), 1);
      bg.fillRoundedRect(x - w/2, y - h/2, w, h, 9);
      bg.lineStyle(2, active ? 0xaaddff : 0x4466aa, 1);
      bg.strokeRoundedRect(x - w/2, y - h/2, w, h, 9);
    };
    draw(false, false);
    this.add.text(x, y, label, {
      fontSize: '15px', fontFamily: 'Arial', color: '#ffffff',
    }).setOrigin(0.5).setDepth(7);
    const z = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true }).setDepth(100);
    z.on('pointerover',  () => draw(false, true));
    z.on('pointerout',   () => draw(false, false));
    z.on('pointerdown',  () => {
      cb();
    });
    return { draw };
  }

  _refreshPlayerBtns(activeIdx) {
    this._playerBtns.forEach((b, i) => b.draw(i === activeIdx, false));
  }

  _createFullscreenButton() {
    const btnX = W - 60, btnY = 30;
    const btnSize = 40;
    
    const bg = this.add.graphics().setDepth(100);
    const draw = (hover) => {
      bg.clear();
      bg.fillStyle(hover ? 0x3a5aaa : 0x2a4a8a, 0.8);
      bg.fillRoundedRect(btnX - btnSize/2, btnY - btnSize/2, btnSize, btnSize, 8);
      bg.lineStyle(2, hover ? 0x88bbff : 0x4466aa, 1);
      bg.strokeRoundedRect(btnX - btnSize/2, btnY - btnSize/2, btnSize, btnSize, 8);
    };
    draw(false);

    const icon = this.add.text(btnX, btnY, '⛶', {
      fontSize: '24px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(101);

    const zone = this.add.zone(btnX, btnY, btnSize, btnSize).setInteractive({ useHandCursor: true }).setDepth(102);
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
