/**
 * ArcadeVerse Cache Inspector - CacheStorage Analyzer
 * Inspects browser CacheStorage instances, counts cached assets, and measures footprint.
 */
(function(window) {
  'use strict';

  class CacheAnalyzer {
    async listCaches() {
      if (!('caches' in window)) return [];
      return await caches.keys();
    }

    async analyzeCache(cacheName) {
      if (!('caches' in window)) return null;
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();

      const items = [];
      let totalBytes = 0;

      for (const req of requests) {
        const res = await cache.match(req);
        let size = 0;
        if (res) {
          const blob = await res.clone().blob();
          size = blob.size;
          totalBytes += size;
        }

        items.push({
          url: req.url,
          pathname: new URL(req.url).pathname,
          size: size,
          sizeKb: (size / 1024).toFixed(1)
        });
      }

      return {
        cacheName,
        totalItems: items.length,
        totalBytes,
        totalMb: (totalBytes / (1024 * 1024)).toFixed(2),
        items
      };
    }

    async purgeCache(cacheName) {
      if (!('caches' in window)) return false;
      return await caches.delete(cacheName);
    }
  }

  window.ArcadeCacheAnalyzer = new CacheAnalyzer();
})(window);
