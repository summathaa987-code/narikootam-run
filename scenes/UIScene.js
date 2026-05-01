/**
 * UIScene.js – Fixed-camera HUD overlay running in parallel with GameScene.
 * Shows: level name, key status, player status cards, controls hint.
 */
import { PhysicsConfig as PC } from '../systems/PhysicsConfig.js';

const W = 1280, H = 720;
const PLAYER_COLORS = ['#ff6666', '#66aaff', '#66ee88', '#ffdd44'];
const PLAYER_NAMES  = ['P1', 'P2', 'P3', 'P4'];

export class UIScene extends Phaser.Scene {
  constructor() { super({ key: 'UIScene' }); }

  create() {
    this.uiReady     = false;
    this._numPlayers = this.registry.get('numPlayers') ?? 2;

    // Top bar
    const bar = this.add.graphics();
    bar.fillStyle(0x000000, 0.6);
    bar.fillRect(0, 0, W, 48);

    // Level text
    this._levelText = this.add.text(16, 13, 'Level 1', {
      fontSize: '20px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold',
    }).setDepth(100);

    // Key status
    this._keyIcon = this.add.text(W / 2 - 90, 10, '🔑', { fontSize: '24px' })
      .setDepth(100).setAlpha(0.3);
    this._keyText = this.add.text(W / 2 - 56, 15, 'Find the Key', {
      fontSize: '16px', fontFamily: 'Arial', color: '#777788',
    }).setDepth(100);

    // Mute button
    this._muteBtn = this.add.text(W - 16, 13, '🔊', { fontSize: '22px' })
      .setOrigin(1, 0).setDepth(100).setInteractive({ useHandCursor: true });
    this._muteBtn.on('pointerdown', () => {
      const sm = this.registry.get('soundManager');
      if (!sm) return;
      sm.toggleMute();
      this._muteBtn.setText(sm._muted ? '🔇' : '🔊');
    });

    // Player cards
    this._cards = [];
    for (let i = 0; i < this._numPlayers; i++) {
      this._cards.push(this._buildCard(i));
    }

    // Controls hint (bottom-right)
    const hints = ['P1:←→↑', 'P2:A D W', 'P3:J L I', 'P4:Num4 6 8'];
    hints.slice(0, this._numPlayers).forEach((h, i) => {
      this.add.text(W - 88, H - 46 + i * 16, h, {
        fontSize: '11px', fontFamily: 'Arial', color: '#444455',
      }).setDepth(100);
    });

    this.uiReady = true;

    // Notify GameScene that UI is ready
    this.time.delayedCall(80, () => {
      const gs = this.scene.get('GameScene');
      gs?._notifyUI?.();
    });
  }

  _buildCard(i) {
    const x = 16 + i * 118;
    const y = H - 54;
    const col = PLAYER_COLORS[i];

    const bg = this.add.graphics().setDepth(99);
    bg.fillStyle(0x111122, 0.8);
    bg.fillRoundedRect(x, y, 110, 46, 7);
    bg.fillStyle(Phaser.Display.Color.HexStringToColor(col).color, 1);
    bg.fillRect(x, y, 4, 46);

    const name = this.add.text(x + 12, y + 6, PLAYER_NAMES[i], {
      fontSize: '13px', fontFamily: 'Arial', color: col, fontStyle: 'bold',
    }).setDepth(100);

    const status = this.add.text(x + 12, y + 25, 'Alive ♥', {
      fontSize: '12px', fontFamily: 'Arial', color: '#44dd88',
    }).setDepth(100);

    return { name, status };
  }

  // ── Public API ────────────────────────────────────────────────────────────

  setLevel(index, name) {
    this._levelText.setText(`Level ${index}  –  ${name}`);
  }

  setKeyCollected(v) {
    if (v) {
      this._keyIcon.setAlpha(1);
      this._keyText.setText('Key Collected!').setColor('#ffdd00');
    }
  }

  updatePlayer(i, alive, respawnSecs) {
    const c = this._cards[i];
    if (!c) return;
    if (alive) {
      c.status.setText('Alive ♥').setColor('#44dd88');
    } else {
      c.status.setText(`Respawn ${respawnSecs}s`).setColor('#ff4444');
    }
  }
}
