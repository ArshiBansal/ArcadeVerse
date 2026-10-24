/**
 * ArcadeVerse Speedrun & Challenge Timer - Core Engine
 * High-precision performance.now() split stopwatch with pause compensation.
 */
(function(window) {
  'use strict';

  class SpeedrunEngine {
    constructor() {
      this.state = 'IDLE'; // IDLE, RUNNING, PAUSED, FINISHED
      this.startTime = 0;
      this.pausedTime = 0;
      this.pauseStart = 0;
      this.splits = [];
      this.currentSplitIndex = 0;
      this.gameId = 'default';
      this.onTick = null;
      this.onSplit = null;
      this.onFinish = null;
      this.rafId = null;
    }

    setCategory(gameId, splitNames = ['Segment 1', 'Segment 2', 'Final Boss']) {
      this.gameId = gameId;
      this.splits = splitNames.map(name => ({
        name,
        time: null,
        delta: null
      }));
      this.reset();
    }

    start() {
      if (this.state === 'RUNNING') return;
      if (this.state === 'PAUSED') {
        this.pausedTime += performance.now() - this.pauseStart;
      } else {
        this.startTime = performance.now();
        this.pausedTime = 0;
        this.currentSplitIndex = 0;
      }
      this.state = 'RUNNING';
      this.loop = this.loop.bind(this);
      this.rafId = requestAnimationFrame(this.loop);
    }

    pause() {
      if (this.state !== 'RUNNING') return;
      this.state = 'PAUSED';
      this.pauseStart = performance.now();
      cancelAnimationFrame(this.rafId);
    }

    reset() {
      this.state = 'IDLE';
      this.startTime = 0;
      this.pausedTime = 0;
      this.currentSplitIndex = 0;
      cancelAnimationFrame(this.rafId);
      this.splits.forEach(s => {
        s.time = null;
        s.delta = null;
      });
      if (this.onTick) this.onTick(0);
    }

    split(pbSplits = []) {
      if (this.state !== 'RUNNING') return;
      const now = performance.now();
      const elapsed = now - this.startTime - this.pausedTime;

      if (this.currentSplitIndex < this.splits.length) {
        const current = this.splits[this.currentSplitIndex];
        current.time = elapsed;

        if (pbSplits[this.currentSplitIndex] && pbSplits[this.currentSplitIndex].time) {
          current.delta = elapsed - pbSplits[this.currentSplitIndex].time;
        }

        if (this.onSplit) this.onSplit(current, this.currentSplitIndex);
        this.currentSplitIndex++;

        if (this.currentSplitIndex >= this.splits.length) {
          this.state = 'FINISHED';
          cancelAnimationFrame(this.rafId);
          if (this.onFinish) this.onFinish(elapsed, this.splits);
        }
      }
    }

    loop() {
      if (this.state !== 'RUNNING') return;
      const elapsed = performance.now() - this.startTime - this.pausedTime;
      if (this.onTick) this.onTick(elapsed);
      this.rafId = requestAnimationFrame(this.loop);
    }

    static formatTime(ms) {
      if (ms === null || isNaN(ms)) return '--:--.--';
      const totalSec = ms / 1000;
      const m = Math.floor(totalSec / 60);
      const s = Math.floor(totalSec % 60);
      const centi = Math.floor((ms % 1000) / 10);
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(centi).padStart(2, '0')}`;
    }
  }

  window.ArcadeSpeedrunEngine = SpeedrunEngine;
})(window);
