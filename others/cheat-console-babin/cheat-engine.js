/**
 * ArcadeVerse Developer Tools - Cheat Code Engine
 * Detects Konami Code and secret keyboard passphrases for testing & verification.
 */
(function(window) {
  'use strict';

  const KONAMI_CODE = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];

  class CheatEngine {
    constructor() {
      this.inputBuffer = [];
      this.activeCheats = new Set();
      this.secretPassphrases = {
        'godmode': 'Invincibility God Mode Activated',
        'turbospeed': '2x Turbo Physics Overdrive',
        'matrixrain': 'Digital Phosphor Rain Mode',
        'unlockall': 'All Arcade Perks & Achievements Unlocked'
      };
      this.init();
    }

    init() {
      window.addEventListener('keydown', (e) => {
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        this.inputBuffer.push(key);
        if (this.inputBuffer.length > 20) {
          this.inputBuffer.shift();
        }

        this.checkKonami();
        this.checkPassphrases();
      });
    }

    checkKonami() {
      const recent = this.inputBuffer.slice(-KONAMI_CODE.length);
      const isMatch = KONAMI_CODE.every((k, i) => k.toLowerCase() === (recent[i] || '').toLowerCase());
      if (isMatch) {
        this.activateCheat('konami', 'Konami Code Verified: 30 Bonus Lives & Infinite Energy Granted!');
        this.inputBuffer = [];
      }
    }

    checkPassphrases() {
      const bufferString = this.inputBuffer.join('').toLowerCase();
      for (const [code, desc] of Object.entries(this.secretPassphrases)) {
        if (bufferString.endsWith(code)) {
          this.activateCheat(code, desc);
          this.inputBuffer = [];
          break;
        }
      }
    }

    activateCheat(code, desc) {
      this.activeCheats.add(code);
      const payload = { code, desc, timestamp: Date.now() };
      window.dispatchEvent(new CustomEvent('arcadeverse:cheat-activated', { detail: payload }));
      this.showToast(`[CHEAT UNLOCKED] ${desc}`);
    }

    showToast(msg) {
      const toast = document.createElement('div');
      toast.className = 'cheat-notification-toast';
      toast.innerHTML = `<span style="color: #00ff88; display: inline-flex; align-items: center; vertical-align: middle; margin-right: 5px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="#00ff88" stroke="#00ff88" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span> ${msg}`;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
      }, 3500);
    }
  }

  window.ArcadeCheatEngine = new CheatEngine();
})(window);
