/**
 * ArcadeVerse Speedrun & Challenge Timer - Split Storage Manager
 * Stores personal bests (PB), categories, and gold segment records in localStorage.
 */
(function(window) {
  'use strict';

  class SplitStorage {
    constructor() {
      this.STORAGE_KEY = 'arcadeverse_speedrun_splits';
    }

    getAllData() {
      try {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        return raw ? JSON.parse(raw) : this.getDefaultCategories();
      } catch (e) {
        return this.getDefaultCategories();
      }
    }

    getDefaultCategories() {
      return {
        'cyber-snake': {
          title: 'Cyber Snake Matrix (100 Pts Any%)',
          splits: [
            { name: '10 Points', time: 14200 },
            { name: '50 Points', time: 48500 },
            { name: '100 Points Finish', time: 92300 }
          ],
          pb: 92300
        },
        'space-invaders': {
          title: 'Space Invaders 2026 (Wave 3 Clear)',
          splits: [
            { name: 'Wave 1', time: 22000 },
            { name: 'Wave 2', time: 51000 },
            { name: 'Wave 3 Boss Clear', time: 84000 }
          ],
          pb: 84000
        },
        'quantum-2048': {
          title: 'Quantum 2048 (512 Tile Speedrun)',
          splits: [
            { name: '128 Tile', time: 35000 },
            { name: '256 Tile', time: 75000 },
            { name: '512 Tile Goal', time: 130000 }
          ],
          pb: 130000
        }
      };
    }

    getCategory(gameId) {
      const all = this.getAllData();
      return all[gameId] || {
        title: `${gameId} Speedrun`,
        splits: [
          { name: 'Check 1', time: null },
          { name: 'Check 2', time: null },
          { name: 'Finish', time: null }
        ],
        pb: null
      };
    }

    saveRun(gameId, splits, finalTime) {
      const all = this.getAllData();
      const cat = all[gameId] || { title: `${gameId} Speedrun`, splits: [], pb: null };

      // Update PB if better or first
      if (!cat.pb || finalTime < cat.pb) {
        cat.pb = finalTime;
        cat.splits = splits.map(s => ({ name: s.name, time: s.time }));
      }

      all[gameId] = cat;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
    }
  }

  window.ArcadeSplitStorage = new SplitStorage();
})(window);
