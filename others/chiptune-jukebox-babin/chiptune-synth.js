/**
 * ArcadeVerse Chiptune Jukebox - 8-Bit Web Audio Synthesizer
 * Emulates vintage PSG sound chips (Square Lead, Triangle Bass, Noise Drums) with ADSR envelopes.
 */
(function(window) {
  'use strict';

  class ChiptuneSynth {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.analyser = null;
      this.muted = false;
      this.volume = 0.3;
    }

    ensureContext() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 64;

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    setVolume(vol) {
      this.volume = Math.max(0, Math.min(1, vol));
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
      }
    }

    playNote(freq, type = 'square', duration = 0.2, time = 0) {
      this.ensureContext();
      if (this.muted || freq <= 0) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, time || this.ctx.currentTime);

      const startTime = time || this.ctx.currentTime;
      gain.gain.setValueAtTime(0.01, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02); // Attack
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Decay/Release

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    }

    playNoise(duration = 0.1, time = 0) {
      this.ensureContext();
      if (this.muted) return;

      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const gain = this.ctx.createGain();
      const startTime = time || this.ctx.currentTime;
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      noise.connect(gain);
      gain.connect(this.masterGain);

      noise.start(startTime);
      noise.stop(startTime + duration + 0.02);
    }
  }

  window.ArcadeChiptuneSynth = new ChiptuneSynth();
})(window);
