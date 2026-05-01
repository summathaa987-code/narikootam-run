/**
 * main.js – Phaser 3 entry point
 * Narikootam Run!: Co-op Puzzle Platformer
 *
 * Run locally:
 *   npx serve .          → http://localhost:3000
 *   python -m http.server → http://localhost:8000
 *
 * Deploy: vercel --prod  (vercel.json already configured)
 */

import { PhysicsConfig as PC } from './systems/PhysicsConfig.js';
import { PreloadScene }        from './scenes/PreloadScene.js';
import { MenuScene }           from './scenes/MenuScene.js';
import { CharacterSelectScene } from './scenes/CharacterSelectScene.js';
import { GameScene }           from './scenes/GameScene.js';
import { UIScene }             from './scenes/UIScene.js';
import { PauseScene }          from './scenes/PauseScene.js';
import { WinScene }            from './scenes/WinScene.js';
import { LoseScene }           from './scenes/LoseScene.js';

const config = {
  type: Phaser.AUTO,
  width:  1280,
  height: 720,
  backgroundColor: '#050510',
  parent: document.body,

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: PC.GRAVITY },
      debug:   false,   // set true to visualise hitboxes
    },
  },

  scale: {
    mode:       Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width:      1280,
    height:     720,
  },

  render: {
    pixelArt:    false,
    antialias:   true,
    roundPixels: false,
    powerPreference: 'high-performance',
  },

  scene: [
    PreloadScene,   // runs first: loads JSON, generates textures
    MenuScene,
    CharacterSelectScene,
    GameScene,
    UIScene,
    PauseScene,
    WinScene,
    LoseScene,
  ],
};

const game = new Phaser.Game(config);

// Expose for browser console debugging
if (typeof window !== 'undefined') window.game = game;
