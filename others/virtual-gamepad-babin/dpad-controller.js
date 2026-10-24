/**
 * ArcadeVerse Virtual Gamepad - Digital D-Pad Controller
 * 4-direction tactical D-Pad for arcade games (Snake, Pac-Man, Space Invaders).
 */
(function(window) {
  'use strict';

  class DPadController {
    constructor(options = {}) {
      this.zone = options.zone || document.body;
      this.onDirectionChange = options.onDirectionChange || null;
      this.activeDirection = null;
      this.dpadEl = null;
      this.initDom();
      this.bindButtons();
    }

    initDom() {
      const dpad = document.createElement('div');
      dpad.className = 'v-dpad-cluster';
      dpad.innerHTML = `
        <button class="dpad-btn dpad-up" data-dir="ArrowUp" aria-label="Up">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
        </button>
        <div class="dpad-middle-row">
          <button class="dpad-btn dpad-left" data-dir="ArrowLeft" aria-label="Left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="dpad-center"></div>
          <button class="dpad-btn dpad-right" data-dir="ArrowRight" aria-label="Right">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
        <button class="dpad-btn dpad-down" data-dir="ArrowDown" aria-label="Down">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      `;
      this.zone.appendChild(dpad);
      this.dpadEl = dpad;
    }

    bindButtons() {
      const buttons = this.dpadEl.querySelectorAll('.dpad-btn');
      buttons.forEach(btn => {
        const dir = btn.getAttribute('data-dir');

        const press = (e) => {
          e.preventDefault();
          btn.classList.add('dpad-pressed');
          this.activeDirection = dir;
          if (this.onDirectionChange) this.onDirectionChange(dir, true);
        };

        const release = (e) => {
          e.preventDefault();
          btn.classList.remove('dpad-pressed');
          if (this.activeDirection === dir) {
            this.activeDirection = null;
            if (this.onDirectionChange) this.onDirectionChange(dir, false);
          }
        };

        btn.addEventListener('touchstart', press, { passive: false });
        btn.addEventListener('touchend', release, { passive: false });
        btn.addEventListener('mousedown', press);
        btn.addEventListener('mouseup', release);
        btn.addEventListener('mouseleave', release);
      });
    }
  }

  window.ArcadeDPadController = DPadController;
})(window);
