/**
 * ArcadeVerse Cache Inspector - Offline Game Verifier
 * Probes registered game endpoints to verify offline readiness and HTTP response status.
 */
(function(window) {
  'use strict';

  class OfflineVerifier {
    constructor() {
      this.endpoints = [
        '../../index.html',
        '../../leaderboard.html',
        '../../assets/css/style.css',
        '../../assets/js/app.js',
        '../../games/cyber-snake_babin/index.html',
        '../../games/space-invaders_babin/index.html',
        '../../games/quantum-2048_babin/index.html',
        '../../games/flappy-jet_mistu7debnath/index.html',
        '../../games/neon-asteroid-escape_joitapaul/index.html'
      ];
    }

    async verifyAll(onProgress = null) {
      const results = [];
      for (let i = 0; i < this.endpoints.length; i++) {
        const url = this.endpoints[i];
        const status = await this.probeUrl(url);
        results.push(status);
        if (onProgress) onProgress(i + 1, this.endpoints.length, status);
      }
      return results;
    }

    async probeUrl(url) {
      const start = performance.now();
      try {
        const res = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
        const latency = (performance.now() - start).toFixed(1);
        return {
          url,
          ok: res.ok,
          status: res.status,
          latencyMs: latency,
          cached: res.headers.get('X-Arcade-Cache') === 'HIT'
        };
      } catch (err) {
        return {
          url,
          ok: false,
          status: 0,
          latencyMs: 0,
          error: err.message
        };
      }
    }
  }

  window.ArcadeOfflineVerifier = new OfflineVerifier();
})(window);
