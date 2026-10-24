/**
 * ArcadeVerse Performance & FPS Telemetry - Dynamic Quality Scaler
 * Detects sustained frame drops and dispatches adaptive canvas resolution / particle scaling.
 */
(function(window) {
  'use strict';

  class QualityScaler {
    constructor() {
      this.currentScale = 1.0;
      this.autoScaleEnabled = true;
      this.lowFpsDuration = 0;
      this.highFpsDuration = 0;
      this.checkInterval = null;
      this.init();
    }

    init() {
      if (!window.ArcadeTelemetryEngine) return;

      this.checkInterval = setInterval(() => {
        if (!this.autoScaleEnabled) return;
        const snap = window.ArcadeTelemetryEngine.getSnapshot();

        if (snap.fps < 40) {
          this.lowFpsDuration += 1;
          this.highFpsDuration = 0;
          if (this.lowFpsDuration >= 3) { // 3 consecutive seconds of <40 FPS
            this.stepDownScale();
            this.lowFpsDuration = 0;
          }
        } else if (snap.fps >= 58) {
          this.highFpsDuration += 1;
          this.lowFpsDuration = 0;
          if (this.highFpsDuration >= 5) { // 5 consecutive seconds of 60 FPS
            this.stepUpScale();
            this.highFpsDuration = 0;
          }
        }
      }, 1000);
    }

    stepDownScale() {
      if (this.currentScale > 0.5) {
        this.currentScale = parseFloat((this.currentScale - 0.25).toFixed(2));
        this.emitScaleChange('down');
      }
    }

    stepUpScale() {
      if (this.currentScale < 1.0) {
        this.currentScale = parseFloat((this.currentScale + 0.25).toFixed(2));
        this.emitScaleChange('up');
      }
    }

    setScale(scale) {
      this.currentScale = Math.max(0.25, Math.min(1.0, scale));
      this.emitScaleChange('manual');
    }

    emitScaleChange(reason) {
      const payload = {
        scale: this.currentScale,
        particleDensity: this.currentScale,
        reason: reason,
        timestamp: Date.now()
      };
      window.dispatchEvent(new CustomEvent('arcadeverse:quality-scale', { detail: payload }));
    }
  }

  window.ArcadeQualityScaler = new QualityScaler();
})(window);
