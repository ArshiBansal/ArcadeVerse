/**
 * ArcadeVerse Cloud Save Vault - Main Controller
 * Handles UI interactions, file drops, snapshot downloads, and slot restoration.
 */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const adapter = window.ArcadeStorageAdapter;
  const modal = window.ArcadeSnapshotModal;

  const totalKeysEl = document.getElementById('stat-total-keys');
  const arcadeWeightEl = document.getElementById('stat-arcade-weight');
  const quotaPercentEl = document.getElementById('stat-quota-percent');
  const dropzone = document.getElementById('vault-dropzone');
  const fileInput = document.getElementById('vault-file-input');
  const exportAllBtn = document.getElementById('btn-export-all');
  const clearArcadeBtn = document.getElementById('btn-clear-arcade');

  function refreshMetrics() {
    if (!adapter) return;
    const metrics = adapter.getStorageMetrics();
    if (totalKeysEl) totalKeysEl.textContent = metrics.arcadeKeys;
    if (arcadeWeightEl) arcadeWeightEl.textContent = metrics.arcadeKb + ' KB';
    if (quotaPercentEl) {
      const pct = ((metrics.totalBytes / (metrics.quotaEstimateKb * 1024)) * 100).toFixed(1);
      quotaPercentEl.textContent = pct + '%';
    }
    renderSlots();
  }

  function renderSlots() {
    for (let slotId = 1; slotId <= 3; slotId++) {
      const slotKey = `arcadeverse_slot_${slotId}`;
      const raw = localStorage.getItem(slotKey);
      const infoEl = document.getElementById(`slot-${slotId}-info`);
      const loadBtn = document.getElementById(`slot-${slotId}-load`);

      if (raw) {
        try {
          const envelope = JSON.parse(raw);
          const dateStr = new Date(envelope.timestamp).toLocaleString();
          infoEl.innerHTML = `<strong>Saved:</strong> ${dateStr}<br><span>${envelope.metrics.keyCount} keys | ${(envelope.metrics.byteWeight / 1024).toFixed(1)} KB</span>`;
          if (loadBtn) loadBtn.disabled = false;
        } catch (e) {
          infoEl.textContent = 'Empty Slot';
          if (loadBtn) loadBtn.disabled = true;
        }
      } else {
        infoEl.textContent = 'Empty Slot — No saved state recorded.';
        if (loadBtn) loadBtn.disabled = true;
      }
    }
  }

  // Setup Slot listeners
  for (let slotId = 1; slotId <= 3; slotId++) {
    const saveBtn = document.getElementById(`slot-${slotId}-save`);
    const loadBtn = document.getElementById(`slot-${slotId}-load`);

    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        try {
          const envelope = await adapter.createEnvelope(`Slot ${slotId}`);
          localStorage.setItem(`arcadeverse_slot_${slotId}`, JSON.stringify(envelope));
          modal.showToast(`Saved current state into Slot ${slotId}`, 'success');
          refreshMetrics();
        } catch (err) {
          modal.showToast(`Failed to save slot: ${err.message}`, 'error');
        }
      });
    }

    if (loadBtn) {
      loadBtn.addEventListener('click', async () => {
        const raw = localStorage.getItem(`arcadeverse_slot_${slotId}`);
        if (!raw) return;
        try {
          const envelope = JSON.parse(raw);
          await adapter.restoreEnvelope(envelope);
          modal.showToast(`Restored state from Slot ${slotId}!`, 'success');
          refreshMetrics();
        } catch (err) {
          modal.showToast(`Failed to load slot: ${err.message}`, 'error');
        }
      });
    }
  }

  // Export Save Bundle (.arcadeverse-save / .json)
  if (exportAllBtn) {
    exportAllBtn.addEventListener('click', async () => {
      try {
        const envelope = await adapter.createEnvelope('ArcadeVerse Master Backup');
        const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const dateTag = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `ArcadeVerse_SaveVault_${dateTag}.arcadeverse-save`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        modal.showToast('Vault backup file downloaded successfully!', 'success');
      } catch (err) {
        modal.showToast(`Export error: ${err.message}`, 'error');
      }
    });
  }

  // Clear Game Data
  if (clearArcadeBtn) {
    clearArcadeBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to purge all arcade save states from local storage? This cannot be undone.')) {
        const metrics = adapter.collectSnapshotData();
        for (const k of Object.keys(metrics.data)) {
          localStorage.removeItem(k);
        }
        modal.showToast('Arcade game storage cleared!', 'success');
        refreshMetrics();
      }
    });
  }

  // Drag & Drop Import
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('drag-active');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('drag-active');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-active');
      if (e.dataTransfer.files.length > 0) {
        handleFileImport(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFileImport(e.target.files[0]);
      }
    });
  }

  function handleFileImport(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const envelope = JSON.parse(e.target.result);
        const res = await adapter.restoreEnvelope(envelope);
        modal.showToast(`Successfully restored ${res.restoredCount} game keys from backup!`, 'success');
        refreshMetrics();
      } catch (err) {
        modal.showToast(`Import rejected: ${err.message}`, 'error');
      }
    };
    reader.onerror = () => modal.showToast('Error reading import file', 'error');
    reader.readAsText(file);
  }

  refreshMetrics();
});
