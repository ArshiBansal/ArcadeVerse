/**
 * ArcadeVerse Cloud Save Vault - Storage Adapter
 * Discovers, packages, validates, and synchronizes game storage keys.
 */
(function(window) {
  'use strict';

  const STORAGE_PREFIXES = [
    'arcade_',
    'arcadeverse_',
    'player_',
    'game_',
    'high_score',
    'quantum_',
    'cyber_',
    'space_',
    'synth_',
    'tactical_',
    'whack_',
    'neon_',
    'flappy_',
    'astro_',
    'memory_',
    'cryptic_'
  ];

  class StorageAdapter {
    constructor() {
      this.version = '2.4.0';
    }

    /**
     * Compute simple SHA-256 equivalent checksum for integrity verification.
     */
    async calculateChecksum(contentString) {
      if (window.crypto && window.crypto.subtle) {
        const msgBuffer = new TextEncoder().encode(contentString);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }
      // Fallback djb2 hash if Web Crypto unavailable
      let hash = 5381;
      for (let i = 0; i < contentString.length; i++) {
        hash = ((hash << 5) + hash) + contentString.charCodeAt(i);
      }
      return 'fallback_' + (hash >>> 0).toString(16);
    }

    /**
     * Collect all ArcadeVerse related keys from localStorage
     */
    collectSnapshotData() {
      const data = {};
      let totalBytes = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;

        const isArcadeKey = STORAGE_PREFIXES.some(prefix => key.toLowerCase().includes(prefix.toLowerCase()));
        if (isArcadeKey || key.startsWith('arc_')) {
          const val = localStorage.getItem(key);
          data[key] = val;
          totalBytes += (key.length + (val ? val.length : 0)) * 2;
        }
      }

      return {
        data,
        keyCount: Object.keys(data).length,
        byteWeight: totalBytes
      };
    }

    /**
     * Build an exportable save envelope
     */
    async createEnvelope(slotName = 'Manual Save') {
      const collected = this.collectSnapshotData();
      const rawPayload = JSON.stringify(collected.data);
      const checksum = await this.calculateChecksum(rawPayload);

      return {
        format: 'arcadeverse-save-bundle',
        version: this.version,
        timestamp: new Date().toISOString(),
        slotName: slotName,
        metrics: {
          keyCount: collected.keyCount,
          byteWeight: collected.byteWeight
        },
        checksum: checksum,
        payload: collected.data
      };
    }

    /**
     * Verify and restore envelope to localStorage
     */
    async restoreEnvelope(envelope, dryRun = false) {
      if (!envelope || envelope.format !== 'arcadeverse-save-bundle') {
        throw new Error('Invalid bundle format: Missing ArcadeVerse signature header.');
      }

      const rawPayload = JSON.stringify(envelope.payload || {});
      const calculatedChecksum = await this.calculateChecksum(rawPayload);

      if (envelope.checksum && !envelope.checksum.startsWith('fallback_') && envelope.checksum !== calculatedChecksum) {
        throw new Error('Integrity check failed! Corrupted or tampered save bundle.');
      }

      if (dryRun) {
        return {
          valid: true,
          keyCount: Object.keys(envelope.payload || {}).length,
          timestamp: envelope.timestamp,
          slotName: envelope.slotName
        };
      }

      let restoredCount = 0;
      for (const [key, val] of Object.entries(envelope.payload || {})) {
        if (typeof val === 'string') {
          localStorage.setItem(key, val);
          restoredCount++;
        }
      }

      return {
        success: true,
        restoredCount,
        timestamp: envelope.timestamp
      };
    }

    /**
     * Calculate localStorage usage stats
     */
    getStorageMetrics() {
      let totalBytes = 0;
      let arcadeBytes = 0;
      let arcadeKeys = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        const val = localStorage.getItem(key) || '';
        const size = (key.length + val.length) * 2;
        totalBytes += size;

        const isArcadeKey = STORAGE_PREFIXES.some(prefix => key.toLowerCase().includes(prefix.toLowerCase()));
        if (isArcadeKey) {
          arcadeBytes += size;
          arcadeKeys++;
        }
      }

      return {
        totalBytes,
        totalKb: (totalBytes / 1024).toFixed(2),
        arcadeBytes,
        arcadeKb: (arcadeBytes / 1024).toFixed(2),
        arcadeKeys,
        quotaEstimateKb: 5120 // ~5MB standard browser localStorage quota
      };
    }
  }

  window.ArcadeStorageAdapter = new StorageAdapter();
})(window);
