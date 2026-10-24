/**
 * ArcadeVerse Cloud Save Vault - In-Game Snapshot Modal
 * Provides quick-save & quick-load keybindings (Ctrl+S / Ctrl+L) and notification toasts.
 */
(function(window) {
  'use strict';

  class SnapshotModal {
    constructor() {
      this.modalEl = null;
      this.toastContainer = null;
      this.init();
    }

    init() {
      this.createToastContainer();
      this.bindShortcuts();
    }

    createToastContainer() {
      if (document.getElementById('arcade-vault-toast-container')) return;
      const container = document.createElement('div');
      container.id = 'arcade-vault-toast-container';
      container.className = 'vault-toast-container';
      document.body.appendChild(container);
      this.toastContainer = container;
    }

    showToast(message, type = 'info') {
      this.createToastContainer();
      const toast = document.createElement('div');
      toast.className = `vault-toast vault-toast-${type}`;

      const iconSvg = type === 'success'
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';

      toast.innerHTML = `
        <span class="toast-icon">${iconSvg}</span>
        <span class="toast-text">${message}</span>
      `;

      this.toastContainer.appendChild(toast);
      setTimeout(() => {
        toast.classList.add('vault-toast-fade');
        setTimeout(() => toast.remove(), 400);
      }, 3000);
    }

    bindShortcuts() {
      window.addEventListener('keydown', (e) => {
        // Quick Save: Ctrl+Alt+S or F6
        if ((e.ctrlKey && e.altKey && e.key.toLowerCase() === 's') || e.key === 'F6') {
          e.preventDefault();
          this.executeQuickSave();
        }
        // Quick Load: Ctrl+Alt+L or F9
        if ((e.ctrlKey && e.altKey && e.key.toLowerCase() === 'l') || e.key === 'F9') {
          e.preventDefault();
          this.executeQuickLoad();
        }
      });
    }

    async executeQuickSave() {
      if (!window.ArcadeStorageAdapter) return;
      try {
        const envelope = await window.ArcadeStorageAdapter.createEnvelope('QuickSave Slot');
        localStorage.setItem('arcadeverse_quicksave_slot', JSON.stringify(envelope));
        this.showToast('Game State Quick-Saved Successfully (Slot: F6)', 'success');
      } catch (err) {
        this.showToast('Quick Save failed: ' + err.message, 'error');
      }
    }

    async executeQuickLoad() {
      if (!window.ArcadeStorageAdapter) return;
      try {
        const raw = localStorage.getItem('arcadeverse_quicksave_slot');
        if (!raw) {
          this.showToast('No Quick-Save snapshot found! Press F6 or Ctrl+Alt+S first.', 'error');
          return;
        }
        const envelope = JSON.parse(raw);
        await window.ArcadeStorageAdapter.restoreEnvelope(envelope);
        this.showToast('Game State Restored! Reloading game data...', 'success');
        setTimeout(() => window.location.reload(), 800);
      } catch (err) {
        this.showToast('Quick Load failed: ' + err.message, 'error');
      }
    }
  }

  window.ArcadeSnapshotModal = new SnapshotModal();
})(window);
