/**
 * ArcadeVerse Performance & FPS Telemetry - Floating HUD Overlay
 * Corner-pinned, draggable floating monitor showing real-time FPS and frametime.
 */
(function(window) {
  'use strict';

  class FPSOverlay {
    constructor() {
      this.overlayEl = null;
      this.fpsValEl = null;
      this.msValEl = null;
      this.graphCanvas = null;
      this.ctx = null;
      this.visible = true;
      this.position = 'top-right'; // top-left, top-right, bottom-right, bottom-left
      this.init();
    }

    init() {
      if (document.getElementById('arcade-fps-hud')) return;

      const overlay = document.createElement('div');
      overlay.id = 'arcade-fps-hud';
      overlay.className = `fps-hud-widget pos-${this.position}`;
      overlay.innerHTML = `
        <div class="hud-drag-handle" title="Drag to reposition">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/>
            <circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>
          </svg>
        </div>
        <div class="hud-main-readout">
          <span class="hud-fps-number" id="hud-fps-val">60</span>
          <span class="hud-fps-unit">FPS</span>
        </div>
        <div class="hud-stats-row">
          <span class="hud-sub-stat"><span id="hud-ms-val">16.6</span> ms</span>
          <span class="hud-sub-stat" id="hud-tier-val">OPTIMAL</span>
        </div>
        <canvas class="hud-sparkline" width="90" height="24" id="hud-sparkline-canvas"></canvas>
      `;

      document.body.appendChild(overlay);
      this.overlayEl = overlay;
      this.fpsValEl = overlay.querySelector('#hud-fps-val');
      this.msValEl = overlay.querySelector('#hud-ms-val');
      this.tierValEl = overlay.querySelector('#hud-tier-val');
      this.graphCanvas = overlay.querySelector('#hud-sparkline-canvas');
      this.ctx = this.graphCanvas.getContext('2d');

      this.bindEvents();
      this.startRenderLoop();
    }

    bindEvents() {
      // Toggle overlay with Shift+F2
      window.addEventListener('keydown', (e) => {
        if (e.shiftKey && e.key === 'F2') {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    toggle() {
      this.visible = !this.visible;
      this.overlayEl.style.display = this.visible ? 'flex' : 'none';
    }

    startRenderLoop() {
      const render = () => {
        if (this.visible && window.ArcadeTelemetryEngine) {
          const snap = window.ArcadeTelemetryEngine.getSnapshot();
          if (this.fpsValEl) {
            this.fpsValEl.textContent = snap.fps;
            this.fpsValEl.className = 'hud-fps-number ' + (snap.fps >= 55 ? 'fps-good' : (snap.fps >= 35 ? 'fps-med' : 'fps-bad'));
          }
          if (this.msValEl) this.msValEl.textContent = snap.frameTime;
          if (this.tierValEl) {
            this.tierValEl.textContent = snap.qualityTier.toUpperCase();
            this.tierValEl.className = 'hud-sub-stat ' + (snap.qualityTier === 'optimal' ? 'tier-good' : 'tier-warn');
          }

          // Draw sparkline
          this.drawSparkline(snap.history);
        }
        requestAnimationFrame(render);
      };
      requestAnimationFrame(render);
    }

    drawSparkline(history) {
      if (!this.ctx || !history || history.length === 0) return;
      const w = this.graphCanvas.width;
      const h = this.graphCanvas.height;

      this.ctx.clearRect(0, 0, w, h);
      this.ctx.beginPath();
      this.ctx.strokeStyle = '#00f0ff';
      this.ctx.lineWidth = 1.5;

      const step = w / (history.length - 1);
      history.forEach((val, idx) => {
        const normalized = Math.max(0, Math.min(1, val / 65));
        const y = h - (normalized * (h - 2));
        const x = idx * step;
        if (idx === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      });
      this.ctx.stroke();
    }
  }

  window.ArcadeFPSOverlay = new FPSOverlay();
})(window);
