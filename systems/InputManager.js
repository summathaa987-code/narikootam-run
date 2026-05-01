/**
 * InputManager.js
 * Abstraction layer for multi-player keyboard input.
 * Supports 2–4 players simultaneously without conflicts.
 * Each player gets an independent InputState.
 */
import { PhysicsConfig } from './PhysicsConfig.js';

/** Key bindings per player index (0-based). 
 * For 1 player: arrow keys
 * For 2+ players: P1=AWD, P2=←↑→, P3=JIL, P4=FTH
 */
const KEY_MAPS = [
  { left: 'A',     right: 'D',     jump: 'W'     },  // P1 (2+ players)
  { left: 'LEFT',  right: 'RIGHT', jump: 'UP'    },  // P2 (←↑→)
  { left: 'J',     right: 'L',     jump: 'I'     },  // P3 (JIL)
  { left: 'F',     right: 'H',     jump: 'T'     },  // P4 (FTH)
];

const KEY_MAPS_1P = [
  { left: 'LEFT',  right: 'RIGHT', jump: 'UP'    },  // 1P uses arrow keys
];

export class InputManager {
  /**
   * @param {Phaser.Scene} scene
   * @param {number}       numPlayers  1–4
   */
  constructor(scene, numPlayers) {
    this.scene      = scene;
    this.numPlayers = Phaser.Math.Clamp(numPlayers, 1, 4);
    this.states     = [];

    for (let i = 0; i < this.numPlayers; i++) {
      this.states.push(this._buildState(i));
    }
  }

  _buildState(index) {
    // For 1 player, use arrow keys; for 2+ players, use standard mapping
    const map  = this.numPlayers === 1 ? KEY_MAPS_1P[0] : KEY_MAPS[index];
    const keys = this.scene.input.keyboard.addKeys({
      left:  map.left,
      right: map.right,
      jump:  map.jump,
    });
    return {
      index,
      enabled:         true,
      keys,
      left:            false,
      right:           false,
      jump:            false,
      jumpJustPressed: false,
      jumpBuffer:      0,    // ms remaining
      coyoteTime:      0,    // ms remaining (set by PlayerController)
      _prevJump:       false,
    };
  }

  /** Call once per frame before updating players. */
  update(delta) {
    for (const s of this.states) {
      if (!s.enabled) { s.left = s.right = s.jump = s.jumpJustPressed = false; continue; }
      s.left  = s.keys.left.isDown;
      s.right = s.keys.right.isDown;
      s.jump  = s.keys.jump.isDown;

      s.jumpJustPressed = s.keys.jump.isDown && !s._prevJump;
      s._prevJump       = s.keys.jump.isDown;

      if (s.jumpJustPressed) {
        s.jumpBuffer = PhysicsConfig.JUMP_BUFFER_TIME;
      } else {
        s.jumpBuffer = Math.max(0, s.jumpBuffer - delta);
      }
      s.coyoteTime = Math.max(0, s.coyoteTime - delta);
    }
  }

  getState(index) { return this.states[index] ?? null; }

  setEnabled(index, v) {
    if (this.states[index]) this.states[index].enabled = v;
  }

  destroy() {
    for (const s of this.states) {
      this.scene.input.keyboard.removeKey(s.keys.left);
      this.scene.input.keyboard.removeKey(s.keys.right);
      this.scene.input.keyboard.removeKey(s.keys.jump);
    }
  }
}
