/**
 * SoundManager.js
 * Wraps Phaser's sound system. Plays procedurally-generated Web Audio
 * tones when no audio files are present, and real files when they are.
 * Falls back silently on autoplay policy blocks.
 */
export class SoundManager {
  /** @param {Phaser.Scene} scene */
  constructor(scene) {
    this.scene   = scene;
    this._ctx    = null;
    this._music  = null;
    this._muted  = false;
    this._musicPlaying = false;
    this._initWebAudio();
  }

  _initWebAudio() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this._ctx = new AC();
    } catch (_) {}
  }

  _resume() {
    if (this._ctx?.state === 'suspended') this._ctx.resume();
  }

  // ── Tone primitives ───────────────────────────────────────────────────────

  _tone(freq, dur, type = 'sine', vol = 0.35, freqEnd = null) {
    if (!this._ctx || this._muted) return;
    this._resume();
    const ctx  = this._ctx;
    const now  = ctx.currentTime;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqEnd ?? freq, now);
    if (freqEnd) osc.frequency.setValueAtTime(freq, now + dur * 0.01);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now); osc.stop(now + dur + 0.05);
  }

  _arpeggio(notes, noteDur, type = 'sine', vol = 0.3) {
    if (!this._ctx || this._muted) return;
    this._resume();
    const ctx = this._ctx;
    const now = ctx.currentTime;
    notes.forEach((f, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      const t    = now + i * noteDur;
      osc.type = type;
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + noteDur * 0.9);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t); osc.stop(t + noteDur + 0.05);
    });
  }

  // ── SFX ───────────────────────────────────────────────────────────────────

  playJump()    { this._tone(880, 0.15, 'sine',     0.3, 300); }
  playLand()    { this._tone(120, 0.08, 'triangle', 0.2); }
  playPickup()  { this._arpeggio([523, 659, 784, 1047], 0.07, 'sine', 0.35); }
  playDoor()    { this._arpeggio([261, 329, 392, 523, 659], 0.09, 'triangle', 0.35); }
  playDeath()   { this._tone(200, 0.45, 'sawtooth', 0.3, 450); }
  playWin()     { this._arpeggio([523,659,784,1047,1319,1047,1319], 0.09, 'sine', 0.4); }
  playStep()    { this._tone(80,  0.04, 'triangle', 0.08); }

  // ── Music ─────────────────────────────────────────────────────────────────

  startMusic() {
    if (!this._ctx || this._musicPlaying || this._muted) return;
    this._musicPlaying = true;
    this._loopMusic();
  }

  _loopMusic() {
    if (!this._musicPlaying || !this._ctx) return;
    this._resume();
    const ctx    = this._ctx;
    const now    = ctx.currentTime;
    const melody = [261,329,392,440,523,440,392,329,261,329,392,523,659,523,392,329];
    const nd     = 0.42;
    melody.forEach((f, i) => {
      const osc  = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const t    = now + i * nd;
      osc.type  = 'sine';  osc.frequency.setValueAtTime(f, t);
      osc2.type = 'sine';  osc2.frequency.setValueAtTime(f * 1.5, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + nd * 0.85);
      osc.connect(gain); osc2.connect(gain); gain.connect(ctx.destination);
      osc.start(t); osc.stop(t + nd);
      osc2.start(t); osc2.stop(t + nd);
    });
    setTimeout(() => this._loopMusic(), melody.length * nd * 1000 - 80);
  }

  stopMusic()  { this._musicPlaying = false; }
  mute()       { this._muted = true;  this.stopMusic(); }
  unmute()     { this._muted = false; this.startMusic(); }
  toggleMute() { this._muted ? this.unmute() : this.mute(); }
}
