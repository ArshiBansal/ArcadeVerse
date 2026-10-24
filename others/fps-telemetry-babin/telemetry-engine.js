/**
 * ArcadeVerse Performance & FPS Telemetry Engine
 * High-precision 60Hz delta-time profiler, frame-drop counter, and heap tracker.
 */
(function(window) {
  'use strict';

  class TelemetryEngine {
    constructor() {
      this.fps = 60;
      this.frameTime = 16.67;
      this.lastTime = performance.now();
      this.framesCount = 0;
      this.fpsHistory = new Array(60).fill(60);
      this.frameDrops = 0;
      this.isRunning = false;
      this.listeners = new Set();
      this.onePercentLow = 60;
    }

    start() {
      if (this.isRunning) return;
      this.isRunning = true;
      this.lastTime = performance.now();
      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
    }

    stop() {
      this.isRunning = false;
    }

    loop(currentTime) {
      if (!this.isRunning) return;

      const delta = currentTime - this.lastTime;
      this.lastTime = currentTime;

      if (delta > 0) {
        const instantFps = Math.min(120, Math.round(1000 / delta));
        this.frameTime = parseFloat(delta.toFixed(2));

        // Rolling average
        this.fpsHistory.shift();
        this.fpsHistory.push(instantFps);

        if (delta > 22.2) { // Dropped below ~45 FPS
          this.frameDrops++;
        }

        // Calculate 1% low
        const sorted = [...this.fpsHistory].sort((a, b) => a - b);
        this.onePercentLow = sorted[Math.max(0, Math.floor(sorted.length * 0.05))];

        const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
        this.fps = Math.round(sum / this.fpsHistory.length);

        const payload = this.getSnapshot();
        this.notify(payload);

        window.dispatchEvent(new CustomEvent('arcadeverse:fps-update', { detail: payload }));
      }

      requestAnimationFrame(this.loop);
    }

    getSnapshot() {
      let memoryMb = null;
      if (window.performance && window.performance.memory) {
        memoryMb = (window.performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(1);
      }

      return {
        fps: this.fps,
        frameTime: this.frameTime,
        onePercentLow: this.onePercentLow,
        frameDrops: this.frameDrops,
        history: [...this.fpsHistory],
        memoryMb: memoryMb,
        qualityTier: this.fps >= 55 ? 'optimal' : (this.fps >= 35 ? 'moderate' : 'low')
      };
    }

    subscribe(callback) {
      this.listeners.add(callback);
      return () => this.listeners.delete(callback);
    }

    notify(data) {
      for (const cb of this.listeners) {
        cb(data);
      }
    }
  }

  window.ArcadeTelemetryEngine = new TelemetryEngine();
  window.ArcadeTelemetryEngine.start();
})(window);
