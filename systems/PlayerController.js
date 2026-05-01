/**
 * PlayerController.js
 * Applies physics-based movement to a Player given an InputState.
 * Handles: acceleration, deceleration, coyote time, jump buffering,
 * variable jump height, air control, terminal velocity.
 */
import { PhysicsConfig as PC } from './PhysicsConfig.js';

export class PlayerController {
  /**
   * @param {import('../objects/Player.js').Player} player
   */
  constructor(player) {
    this.player = player;
  }

  /**
   * @param {number}     delta  frame delta ms
   * @param {InputState} input  from InputManager
   */
  update(delta, input) {
    const p  = this.player;
    if (!p.alive) return;

    const dt       = delta / 1000;
    const body     = p.sprite.body;
    const onGround = body.blocked.down;

    // ── Coyote time ──────────────────────────────────────────────────────
    if (onGround) {
      input.coyoteTime = PC.COYOTE_TIME;
    }

    // ── Horizontal movement ───────────────────────────────────────────────
    const accel = onGround ? PC.ACCELERATION : PC.AIR_ACCELERATION;
    const decel = onGround ? PC.DECELERATION : PC.AIR_DECELERATION;

    if (input.left) {
      body.velocity.x = Math.max(body.velocity.x - accel * dt, -PC.MOVE_SPEED);
      p.facingRight = false;
    } else if (input.right) {
      body.velocity.x = Math.min(body.velocity.x + accel * dt,  PC.MOVE_SPEED);
      p.facingRight = true;
    } else {
      // Decelerate toward zero
      const sign = Math.sign(body.velocity.x);
      const dv   = decel * dt;
      body.velocity.x = Math.abs(body.velocity.x) <= dv
        ? 0
        : body.velocity.x - sign * dv;
    }

    // Absolute speed cap
    body.velocity.x = Phaser.Math.Clamp(body.velocity.x, -PC.MAX_RUN_SPEED, PC.MAX_RUN_SPEED);

    // ── Jump ──────────────────────────────────────────────────────────────
    if (input.jumpBuffer > 0 && (onGround || input.coyoteTime > 0)) {
      body.velocity.y  = PC.JUMP_VELOCITY;
      input.jumpBuffer = 0;
      input.coyoteTime = 0;
      p.scene.events.emit('player-jumped', p.index);
    }

    // Variable jump height: cut velocity on early release
    if (!input.jump && body.velocity.y < -200) {
      body.velocity.y *= Math.pow(PC.JUMP_CUT_MULTIPLIER, dt * 60);
    }

    // Terminal velocity
    if (body.velocity.y > PC.MAX_FALL_SPEED) {
      body.velocity.y = PC.MAX_FALL_SPEED;
    }
  }
}
