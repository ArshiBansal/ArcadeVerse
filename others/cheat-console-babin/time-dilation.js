/**
 * ArcadeVerse Developer Tools - Time Dilation & Frame Stepper Engine
 * Modulates game loop speeds (0.25x slow-mo, 2x fast-forward, frame stepping) for debugging.
 */
(function(window) {
  'use strict';

  class TimeDilationEngine {
    constructor() {
      this.timeScale = 1.0;
      this.isPaused = false;
      this.stepNextFrame = false;
      this.init();
    }

    init() {
      // Hotkeys: [ slows time, ] speeds time, \ pauses/unpauses
      window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.key === '[') {
          e.preventDefault();
          this.setTimeScale(Math.max(0.25, this.timeScale - 0.25));
        } else if (e.key === ']') {
          e.preventDefault();
          this.setTimeScale(Math.min(3.0, this.timeScale + 0.25));
        } else if (e.key === '\\') {
          e.preventDefault();
          this.togglePause();
        }
      });
    }

    setTimeScale(scale) {
      this.timeScale = parseFloat(scale.toFixed(2));
      window.dispatchEvent(new CustomEvent('arcadeverse:timescale-change', {
        detail: { timeScale: this.timeScale, isPaused: this.isPaused }
      }));
    }

    togglePause() {
      this.isPaused = !this.isPaused;
      window.dispatchEvent(new CustomEvent('arcadeverse:timescale-change', {
        detail: { timeScale: this.timeScale, isPaused: this.isPaused }
      }));
    }
  }

  window.ArcadeTimeDilation = new TimeDilationEngine();
})(window);
