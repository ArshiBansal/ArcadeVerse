/**
 * ArcadeVerse Virtual Gamepad - Analog Virtual Joystick
 * 360-degree floating touch joystick with deadzone and normalized vector calculation.
 */
(function(window) {
  'use strict';

  class VirtualJoystick {
    constructor(options = {}) {
      this.zone = options.zone || document.body;
      this.maxRadius = options.maxRadius || 50;
      this.deadzone = options.deadzone || 10;
      this.touchId = null;
      this.baseX = 0;
      this.baseY = 0;
      this.currentX = 0;
      this.currentY = 0;
      this.vector = { x: 0, y: 0, angle: 0, distance: 0 };
      this.active = false;
      this.onMove = options.onMove || null;
      this.onEnd = options.onEnd || null;

      this.stickEl = null;
      this.baseEl = null;
      this.initDom();
      this.bindEvents();
    }

    initDom() {
      const container = document.createElement('div');
      container.className = 'v-joystick-container';
      container.innerHTML = `
        <div class="v-joystick-base">
          <div class="v-joystick-thumb"></div>
        </div>
      `;
      this.zone.appendChild(container);
      this.containerEl = container;
      this.baseEl = container.querySelector('.v-joystick-base');
      this.stickEl = container.querySelector('.v-joystick-thumb');
    }

    bindEvents() {
      this.zone.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
      window.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
      window.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
      window.addEventListener('touchcancel', (e) => this.handleTouchEnd(e), { passive: false });
    }

    handleTouchStart(e) {
      if (this.active) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.clientX < window.innerWidth / 2) { // Left half of screen
          e.preventDefault();
          this.touchId = touch.identifier;
          this.active = true;
          this.baseX = touch.clientX;
          this.baseY = touch.clientY;
          this.currentX = this.baseX;
          this.currentY = this.baseY;

          this.containerEl.style.display = 'block';
          this.containerEl.style.left = `${this.baseX - 60}px`;
          this.containerEl.style.top = `${this.baseY - 60}px`;
          this.updateThumb(0, 0);
          break;
        }
      }
    }

    handleTouchMove(e) {
      if (!this.active) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.touchId) {
          e.preventDefault();
          const dx = touch.clientX - this.baseX;
          const dy = touch.clientY - this.baseY;
          const dist = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx);

          const clampedDist = Math.min(this.maxRadius, dist);
          const thumbX = Math.cos(angle) * clampedDist;
          const thumbY = Math.sin(angle) * clampedDist;

          this.updateThumb(thumbX, thumbY);

          if (dist > this.deadzone) {
            const normDist = (clampedDist - this.deadzone) / (this.maxRadius - this.deadzone);
            this.vector.x = parseFloat((Math.cos(angle) * normDist).toFixed(2));
            this.vector.y = parseFloat((Math.sin(angle) * normDist).toFixed(2));
            this.vector.angle = angle;
            this.vector.distance = normDist;
          } else {
            this.vector.x = 0;
            this.vector.y = 0;
            this.vector.distance = 0;
          }

          if (this.onMove) this.onMove(this.vector);
          break;
        }
      }
    }

    handleTouchEnd(e) {
      if (!this.active) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this.touchId) {
          this.active = false;
          this.touchId = null;
          this.vector = { x: 0, y: 0, angle: 0, distance: 0 };
          this.containerEl.style.display = 'none';
          if (this.onEnd) this.onEnd();
          break;
        }
      }
    }

    updateThumb(x, y) {
      if (this.stickEl) {
        this.stickEl.style.transform = `translate(${x}px, ${y}px)`;
      }
    }
  }

  window.ArcadeVirtualJoystick = VirtualJoystick;
})(window);
