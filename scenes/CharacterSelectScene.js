/**
 * CharacterSelectScene.js
 * Character selection screen for 2-4 players.
 * Each player independently selects from 10 characters.
 */
import { CHARACTERS } from '../data/CharacterData.js';
import { CharacterGenerator } from '../systems/CharacterGenerator.js';

const W = 1280, H = 720;

export class CharacterSelectScene extends Phaser.Scene {
  constructor() { super({ key: 'CharacterSelectScene' }); }

  create() {
    this._numPlayers = this.registry.get('numPlayers') ?? 2;
    
    // Player selections (character index for each player)
    this._selections = Array(this._numPlayers).fill(0);
    this._confirmed = Array(this._numPlayers).fill(false);
    this._activePlayer = 0; // Currently selecting player
    
    // UI
    this._drawBackground();
    this._drawTitle();
    this._drawCharacterGrid();
    this._drawPlayerPanels();
    this._drawStartButton();
    
    // Instructions
    this.add.text(W / 2, 690, '1. Click a player panel  →  2. Click a character  →  3. Click READY  →  Repeat for all players', {
      fontSize: '14px', fontFamily: 'Arial', color: '#aaddff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(10);
    
    // Fullscreen button
    this._createFullscreenButton();
    
    // CTRL+F = fullscreen
    this.input.keyboard.on('keydown', (event) => {
      if (event.ctrlKey && event.key === 'f') {
        event.preventDefault();
        this._toggleFullscreen();
      }
    });
  }

  update() {
    this._checkAllConfirmed();
  }

  // ── UI ────────────────────────────────────────────────────────────────────

  _drawBackground() {
    const bg = this.add.graphics().setDepth(0);
    bg.fillStyle(0x050510, 1);
    bg.fillRect(0, 0, W, H);

    // Stars
    const rng = new Phaser.Math.RandomDataGenerator(['charselect']);
    for (let i = 0; i < 100; i++) {
      bg.fillStyle(0xffffff, rng.realInRange(0.2, 0.6));
      bg.fillCircle(rng.integerInRange(0, W), rng.integerInRange(0, H), rng.integerInRange(1, 2));
    }
  }

  _drawTitle() {
    this.add.text(W / 2, 50, 'SELECT YOUR CHARACTER', {
      fontSize: '42px', fontFamily: 'Arial Black, Arial',
      color: '#ffdd44', stroke: '#aa6600', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(10);
  }

  _drawCharacterGrid() {
    const gridX = 200;
    const gridY = 120;
    const cols = 5;
    const cellW = 120;
    const cellH = 140;

    this._charCells = [];

    for (let i = 0; i < CHARACTERS.length; i++) {
      const char = CHARACTERS[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = gridX + col * cellW;
      const cy = gridY + row * cellH;

      // Cell background
      const cell = this.add.graphics().setDepth(5);
      cell.fillStyle(0x1a1a2a, 1);
      cell.fillRoundedRect(cx, cy, 100, 120, 8);
      cell.lineStyle(2, 0x3a3a5a, 1);
      cell.strokeRoundedRect(cx, cy, 100, 120, 8);

      // Character sprite (idle animation)
      // Check if individual frame exists (p{charNum}1), otherwise skip
      const charNum = i + 1;
      const frameKey = `p${charNum}1`;
      
      // Character name
      this.add.text(cx + 50, cy + 100, char.name, {
        fontSize: '14px', fontFamily: 'Arial', color: '#aaaacc',
      }).setOrigin(0.5).setDepth(6);
      
      // Make clickable zone
      const zone = this.add.zone(cx + 50, cy + 60, 100, 120).setInteractive({ useHandCursor: true }).setDepth(7);
      
      if (this.textures.exists(frameKey)) {
        const sprite = this.add.sprite(cx + 50, cy + 50, frameKey, 0).setDepth(6);
        sprite.setScale(0.15); // Small preview
        
        // Try to play idle animation if it exists
        const animKey = `${char.key}_idle`;
        if (this.anims.exists(animKey)) {
          sprite.play(animKey);
        }
        
        // Setup zone interactions
        zone.on('pointerover', () => {
          cell.clear();
          cell.fillStyle(0x2a2a4a, 1);
          cell.fillRoundedRect(cx, cy, 100, 120, 8);
          cell.lineStyle(2, 0x5a5a8a, 1);
          cell.strokeRoundedRect(cx, cy, 100, 120, 8);
        });
        zone.on('pointerout', () => {
          cell.clear();
          cell.fillStyle(0x1a1a2a, 1);
          cell.fillRoundedRect(cx, cy, 100, 120, 8);
          cell.lineStyle(2, 0x3a3a5a, 1);
          cell.strokeRoundedRect(cx, cy, 100, 120, 8);
        });
        zone.on('pointerdown', () => {
          if (!this._confirmed[this._activePlayer]) {
            this._selections[this._activePlayer] = i;
            this._updatePlayerPanel(this._activePlayer);
            this.registry.get('soundManager')?.playPickup();
          }
        });
        
        this._charCells.push({ cell, sprite, cx, cy, zone, available: true });
      } else {
        // Character not available - show placeholder
        this.add.text(cx + 50, cy + 50, '?', {
          fontSize: '48px', fontFamily: 'Arial', color: '#555566',
        }).setOrigin(0.5).setDepth(6);
        
        this.add.text(cx + 50, cy + 80, 'Coming\nSoon', {
          fontSize: '12px', fontFamily: 'Arial', color: '#666677', align: 'center',
        }).setOrigin(0.5).setDepth(6);
        
        // Disable zone for unavailable characters
        zone.removeInteractive();
        
        this._charCells.push({ cell, sprite: null, cx, cy, zone, available: false });
      }
    }
  }

  _drawPlayerPanels() {
    const panelY = 420;  // Moved up from 480
    const panelW = 260;
    const panelH = 180;  // Reduced from 200
    const spacing = 20;
    const totalW = this._numPlayers * panelW + (this._numPlayers - 1) * spacing;
    const startX = (W - totalW) / 2;

    const colors = ['#ee4444', '#4488ee', '#44cc66', '#eecc22'];
    const names = ['PLAYER 1', 'PLAYER 2', 'PLAYER 3', 'PLAYER 4'];

    this._playerPanels = [];

    for (let i = 0; i < this._numPlayers; i++) {
      const px = startX + i * (panelW + spacing);
      
      const panel = this.add.graphics().setDepth(8);
      const drawPanel = (active, confirmed) => {
        panel.clear();
        panel.fillStyle(0x1a1a2a, 1);
        panel.fillRoundedRect(px, panelY, panelW, panelH, 10);
        const borderColor = confirmed ? 0x44ff44 : (active ? 0xffdd44 : Phaser.Display.Color.HexStringToColor(colors[i]).color);
        panel.lineStyle(3, borderColor, 1);
        panel.strokeRoundedRect(px, panelY, panelW, panelH, 10);
      };
      drawPanel(i === 0, false);

      // Player label
      this.add.text(px + panelW / 2, panelY + 20, names[i], {
        fontSize: '18px', fontFamily: 'Arial', color: colors[i], fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(9);

      // Character preview
      const char = CHARACTERS[this._selections[i]];
      const textureKey = this.textures.exists('all_characters') ? 'all_characters' : char.key;
      const charSprite = this.add.sprite(px + panelW / 2, panelY + 90, textureKey, 0).setDepth(9);
      // Scale down if using external high-res sprites
      if (textureKey === 'all_characters') {
        charSprite.setScale(0.05);
      }
      charSprite.play(`${char.key}_idle`);

      // Character name
      const charName = this.add.text(px + panelW / 2, panelY + 140, char.name, {
        fontSize: '16px', fontFamily: 'Arial', color: '#ffffff',
      }).setOrigin(0.5).setDepth(9);

      // Panel click zone (to activate player)
      const panelZone = this.add.zone(px + panelW / 2, panelY + 70, panelW, 120).setInteractive({ useHandCursor: true }).setDepth(9);
      panelZone.on('pointerdown', () => {
        this._activePlayer = i;
        this._updateAllPanelBorders();
      });

      // Ready button
      const btnY = panelY + 150;  // Adjusted for new panel height
      const btnBg = this.add.graphics().setDepth(10);
      const drawBtn = (hover, confirmed) => {
        btnBg.clear();
        if (confirmed) {
          btnBg.fillStyle(0x44aa44, 1);
          btnBg.fillRoundedRect(px + 30, btnY - 12, 200, 28, 6);
          btnBg.lineStyle(2, 0x88ff88, 1);
          btnBg.strokeRoundedRect(px + 30, btnY - 12, 200, 28, 6);
        } else {
          btnBg.fillStyle(hover ? 0x4477cc : 0x2a4a8a, 1);
          btnBg.fillRoundedRect(px + 30, btnY - 12, 200, 28, 6);
        }
      };
      drawBtn(false, false);

      const btnText = this.add.text(px + panelW / 2, btnY, 'READY', {
        fontSize: '14px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(11);

      const btnZone = this.add.zone(px + panelW / 2, btnY, 200, 28).setInteractive({ useHandCursor: true }).setDepth(12);
      btnZone.on('pointerover', () => {
        if (!this._confirmed[i]) drawBtn(true, false);
      });
      btnZone.on('pointerout', () => {
        if (!this._confirmed[i]) drawBtn(false, this._confirmed[i]);
      });
      btnZone.on('pointerdown', () => {
        if (!this._confirmed[i]) {
          this._confirmed[i] = true;
          drawBtn(false, true);
          btnText.setText('✓ READY').setColor('#44ff44');
          this.registry.get('soundManager')?.playPickup();
          this._updateAllPanelBorders();
        } else {
          // Unconfirm
          this._confirmed[i] = false;
          drawBtn(false, false);
          btnText.setText('READY').setColor('#ffffff');
          this._updateAllPanelBorders();
        }
      });

      this._playerPanels.push({ 
        panel, charSprite, charName, btnBg, btnText, panelZone, btnZone,
        px, panelY, drawPanel, drawBtn, i 
      });
    }
  }

  _updatePlayerPanel(playerIndex) {
    const p = this._playerPanels[playerIndex];
    const char = CHARACTERS[this._selections[playerIndex]];
    
    // Update sprite - use correct texture key
    const textureKey = this.textures.exists('all_characters') ? 'all_characters' : char.key;
    p.charSprite.setTexture(textureKey, 0);
    // Scale down if using external high-res sprites
    if (textureKey === 'all_characters') {
      p.charSprite.setScale(0.15);
    }
    p.charSprite.play(`${char.key}_idle`);
    
    // Update name
    p.charName.setText(char.name);
  }

  _updateAllPanelBorders() {
    for (let i = 0; i < this._numPlayers; i++) {
      const p = this._playerPanels[i];
      p.drawPanel(i === this._activePlayer, this._confirmed[i]);
    }
  }

  _drawStartButton() {
    const bx = W / 2, by = 640;  // Moved down to avoid overlap
    const bw = 280, bh = 50;

    this._startBg = this.add.graphics().setDepth(10);
    this._startBg.fillStyle(0x2a4a8a, 0.5);
    this._startBg.fillRoundedRect(bx - bw / 2, by - bh / 2, bw, bh, 10);

    this._startText = this.add.text(bx, by, 'Waiting for players...', {
      fontSize: '20px', fontFamily: 'Arial', color: '#666688',
    }).setOrigin(0.5).setDepth(11);

    this._startZone = this.add.zone(bx, by, bw, bh).setDepth(12);
  }

  _checkAllConfirmed() {
    const allReady = this._confirmed.slice(0, this._numPlayers).every(c => c);
    
    if (allReady && !this._startZone.input) {
      this._startBg.clear();
      this._startBg.fillStyle(0x44aa44, 1);
      this._startBg.fillRoundedRect(W / 2 - 140, 615, 280, 50, 10);  // Adjusted position
      this._startBg.lineStyle(2, 0x88ff88, 1);
      this._startBg.strokeRoundedRect(W / 2 - 140, 615, 280, 50, 10);

      this._startText.setText('▶  START GAME').setColor('#ffffff');
      
      this._startZone.setInteractive({ useHandCursor: true });
      this._startZone.on('pointerdown', () => this._startGame());
      this._startZone.on('pointerover', () => {
        this._startBg.clear();
        this._startBg.fillStyle(0x55cc55, 1);
        this._startBg.fillRoundedRect(W / 2 - 140, 615, 280, 50, 10);
        this._startBg.lineStyle(2, 0xaaffaa, 1);
        this._startBg.strokeRoundedRect(W / 2 - 140, 615, 280, 50, 10);
      });
      this._startZone.on('pointerout', () => {
        this._startBg.clear();
        this._startBg.fillStyle(0x44aa44, 1);
        this._startBg.fillRoundedRect(W / 2 - 140, 615, 280, 50, 10);
        this._startBg.lineStyle(2, 0x88ff88, 1);
        this._startBg.strokeRoundedRect(W / 2 - 140, 615, 280, 50, 10);
      });
    }
  }

  _startGame() {
    // Build player data
    const playerData = [];
    for (let i = 0; i < this._numPlayers; i++) {
      playerData.push({
        id: i,
        character: CHARACTERS[this._selections[i]].key,
      });
    }

    this.registry.set('playerCharacters', playerData);
    this.registry.get('soundManager')?.playWin();
    
    this.time.delayedCall(200, () => {
      this.scene.start('GameScene');
    });
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
