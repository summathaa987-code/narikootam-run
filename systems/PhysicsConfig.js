/**
 * PhysicsConfig.js
 * Central physics constants. Tune all game-feel here.
 * Used by PlayerController and Phaser world config.
 */
export const PhysicsConfig = {
  // World
  GRAVITY:            2000,   // px/s² - slightly higher for snappier feel

  // Horizontal movement - improved responsiveness
  MOVE_SPEED:          280,   // px/s  target speed (faster)
  ACCELERATION:       2400,   // px/s² ground accel (much faster response)
  DECELERATION:       2800,   // px/s² ground decel (quick stops)
  AIR_ACCELERATION:   1400,   // px/s² air accel (better air control)
  AIR_DECELERATION:    800,   // px/s² air decel (floatier in air)

  // Jump - improved feel
  JUMP_VELOCITY:      -800,   // px/s  (negative = up) - higher jump
  JUMP_CUT_MULTIPLIER: 0.40,  // velocity multiplier on early release (variable jump height)
  COYOTE_TIME:         150,   // ms - grace period after leaving platform
  JUMP_BUFFER_TIME:    150,   // ms - jump input buffering

  // Limits
  MAX_FALL_SPEED:     1100,   // terminal velocity px/s
  MAX_RUN_SPEED:       320,   // absolute cap px/s

  // Tile size
  TILE_SIZE:            48,
};
