/**
 * ArcadeVerse Cache Inspector - Storage Quota Tracker
 * Queries navigator.storage.estimate() to measure disk usage against device quota limits.
 */
(function(window) {
  'use strict';

  class StorageQuotaTracker {
    async getQuotaMetrics() {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const est = await navigator.storage.estimate();
        const usageMb = (est.usage / (1024 * 1024)).toFixed(2);
        const quotaMb = (est.quota / (1024 * 1024)).toFixed(2);
        const percent = ((est.usage / est.quota) * 100).toFixed(2);

        return {
          supported: true,
          usageBytes: est.usage,
          quotaBytes: est.quota,
          usageMb,
          quotaMb,
          percentUsed: percent
        };
      }

      return {
        supported: false,
        usageMb: 'N/A',
        quotaMb: 'N/A',
        percentUsed: '0'
      };
    }
  }

  window.ArcadeStorageQuota = new StorageQuotaTracker();
})(window);
