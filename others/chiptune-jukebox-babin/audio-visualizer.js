/**
 * ArcadeVerse Chiptune Jukebox - Audio Visualizer
 * Real-time 32-band FFT frequency visualizer canvas.
 */
(function(window) {
  'use strict';

  class AudioVisualizer {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.synth = window.ArcadeChiptuneSynth;
      this.isRunning = false;
    }

    start() {
      if (this.isRunning) return;
      this.isRunning = true;
      this.draw = this.draw.bind(this);
      requestAnimationFrame(this.draw);
    }

    stop() {
      this.isRunning = false;
    }

    draw() {
      if (!this.isRunning) return;
      const w = this.canvas.width;
      const h = this.canvas.height;
      this.ctx.clearRect(0, 0, w, h);

      if (this.synth.analyser) {
        const bufferLength = this.synth.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.synth.analyser.getByteFrequencyData(dataArray);

        const barCount = 28;
        const barWidth = (w / barCount) - 3;

        for (let i = 0; i < barCount; i++) {
          const val = dataArray[i * 2] || 0;
          const barHeight = Math.max(4, (val / 255) * (h - 10));
          const x = i * (barWidth + 3);
          const y = h - barHeight;

          const gradient = this.ctx.createLinearGradient(0, y, 0, h);
          gradient.addColorStop(0, '#00f0ff');
          gradient.addColorStop(1, '#ff007f');

          this.ctx.fillStyle = gradient;
          this.ctx.shadowColor = '#00f0ff';
          this.ctx.shadowBlur = 8;
          this.ctx.fillRect(x, y, barWidth, barHeight);
          this.ctx.shadowBlur = 0;
        }
      }

      requestAnimationFrame(this.draw);
    }
  }

  window.ArcadeAudioVisualizer = AudioVisualizer;
})(window);
