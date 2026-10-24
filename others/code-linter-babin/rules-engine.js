/**
 * ArcadeVerse Contributor Code Linter - Rules Engine
 * Defines official contribution rules, severity levels, and validation logic.
 */
(function(window) {
  'use strict';

  const RULES = [
    {
      id: 'no-emojis',
      name: 'Forbidden Emojis in Game UI',
      severity: 'error',
      description: 'Emojis are strictly disallowed in game UI and buttons. SVG or Lucide icons must be used instead.',
      test: (code, ext) => {
        if (ext === 'json') return [];
        // Regex matching common unicode emojis
        const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
        const matches = [];
        const lines = code.split('\n');
        lines.forEach((line, lineIdx) => {
          let m;
          while ((m = emojiRegex.exec(line)) !== null) {
            matches.push({ line: lineIdx + 1, message: `Found emoji '${m[0]}'. Replace with SVG or Lucide icon.` });
          }
        });
        return matches;
      }
    },
    {
      id: 'no-external-frameworks',
      name: 'No Frameworks or Bundlers',
      severity: 'error',
      description: 'Code must be 100% pure vanilla HTML5, CSS3, and JavaScript without React, Vue, jQuery, or Python.',
      test: (code, ext) => {
        const matches = [];
        const lines = code.split('\n');
        const forbidden = ['react', 'vue', 'angular', 'jquery', 'bootstrap', 'tailwind', 'axios'];
        lines.forEach((line, lineIdx) => {
          const lower = line.toLowerCase();
          for (const word of forbidden) {
            if (lower.includes(`from '${word}'`) || lower.includes(`from "${word}"`) || lower.includes(`${word}.min.js`)) {
              matches.push({ line: lineIdx + 1, message: `Disallowed external framework or dependency '${word}' found.` });
            }
          }
        });
        return matches;
      }
    },
    {
      id: 'touch-controls-check',
      name: 'Mobile Touch Controls Check',
      severity: 'warning',
      description: 'Interactive canvas games should include touchstart or pointerdown listeners for mobile playability.',
      test: (code, ext) => {
        if (ext !== 'js') return [];
        const hasTouch = code.includes('touchstart') || code.includes('pointerdown') || code.includes('touchmove');
        if (!hasTouch) {
          return [{ line: 1, message: 'Game lacks touch listeners (touchstart / pointerdown). Consider adding mobile controls.' }];
        }
        return [];
      }
    },
    {
      id: 'raf-leak-protection',
      name: 'Animation Frame Cleanup Protection',
      severity: 'warning',
      description: 'Ensure requestAnimationFrame calls can be cancelled via cancelAnimationFrame to prevent memory leaks.',
      test: (code, ext) => {
        if (ext !== 'js') return [];
        if (code.includes('requestAnimationFrame') && !code.includes('cancelAnimationFrame')) {
          return [{ line: 1, message: 'requestAnimationFrame detected without cancelAnimationFrame. Ensure game loops can be paused.' }];
        }
        return [];
      }
    }
  ];

  window.ArcadeLinterRules = RULES;
})(window);
