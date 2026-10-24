/**
 * ArcadeVerse Developer Tools - Quake-Style Debug CLI Terminal
 * Drop-down command line interface for executing runtime developer utilities.
 */
(function(window) {
  'use strict';

  class DebugTerminal {
    constructor() {
      this.isOpen = false;
      this.history = [];
      this.historyIndex = -1;
      this.commands = {};
      this.terminalEl = null;
      this.outputEl = null;
      this.inputEl = null;
      this.init();
    }

    init() {
      this.registerDefaultCommands();
      this.createDom();
      this.bindKey();
    }

    createDom() {
      if (document.getElementById('arcade-debug-terminal')) return;

      const term = document.createElement('div');
      term.id = 'arcade-debug-terminal';
      term.className = 'debug-terminal';
      term.innerHTML = `
        <div class="terminal-header">
          <span>ARCADEVERSE DEBUG CONSOLE v2.4 (Press \` or ~ to close)</span>
          <button class="terminal-close-btn" id="term-close">&times;</button>
        </div>
        <div class="terminal-output" id="term-output">
          <div class="term-line term-system">Welcome to ArcadeVerse Runtime Console. Type 'help' for commands.</div>
        </div>
        <div class="terminal-input-row">
          <span class="term-prompt">&gt;</span>
          <input type="text" class="term-input" id="term-input" placeholder="Type a command..." autocomplete="off">
        </div>
      `;

      document.body.appendChild(term);
      this.terminalEl = term;
      this.outputEl = term.querySelector('#term-output');
      this.inputEl = term.querySelector('#term-input');

      term.querySelector('#term-close').addEventListener('click', () => this.toggle());

      this.inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const cmd = this.inputEl.value.trim();
          if (cmd) {
            this.execute(cmd);
            this.history.push(cmd);
            this.historyIndex = this.history.length;
            this.inputEl.value = '';
          }
        } else if (e.key === 'ArrowUp') {
          if (this.historyIndex > 0) {
            this.historyIndex--;
            this.inputEl.value = this.history[this.historyIndex] || '';
          }
        } else if (e.key === 'ArrowDown') {
          if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.inputEl.value = this.history[this.historyIndex] || '';
          } else {
            this.historyIndex = this.history.length;
            this.inputEl.value = '';
          }
        }
      });
    }

    bindKey() {
      window.addEventListener('keydown', (e) => {
        if (e.key === '`' || e.key === '~') {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    toggle() {
      this.isOpen = !this.isOpen;
      if (this.terminalEl) {
        this.terminalEl.classList.toggle('terminal-open', this.isOpen);
        if (this.isOpen) {
          setTimeout(() => this.inputEl.focus(), 100);
        }
      }
    }

    println(text, type = 'normal') {
      const line = document.createElement('div');
      line.className = `term-line term-${type}`;
      line.textContent = text;
      this.outputEl.appendChild(line);
      this.outputEl.scrollTop = this.outputEl.scrollHeight;
    }

    registerCommand(name, handler, description) {
      this.commands[name.toLowerCase()] = { handler, description };
    }

    registerDefaultCommands() {
      this.registerCommand('help', () => {
        this.println('Available Commands:');
        for (const [name, meta] of Object.entries(this.commands)) {
          this.println(`  ${name.padEnd(14)} - ${meta.description}`);
        }
      }, 'List all available terminal commands');

      this.registerCommand('clear', () => {
        this.outputEl.innerHTML = '';
      }, 'Clear terminal buffer');

      this.registerCommand('god', () => {
        window.ArcadeCheatEngine.activateCheat('godmode', 'God Mode: Damage immunity enabled.');
        this.println('God Mode toggled ON.', 'success');
      }, 'Toggle invincibility state');

      this.registerCommand('speed', (args) => {
        const val = parseFloat(args[0]) || 1.0;
        window.ArcadeTimeDilation.setTimeScale(val);
        this.println(`Game time scale set to ${val}x`, 'success');
      }, 'Set game speed multiplier (e.g. speed 0.5)');

      this.registerCommand('fps', () => {
        if (window.ArcadeFPSOverlay) {
          window.ArcadeFPSOverlay.toggle();
          this.println('Toggled floating FPS monitor.', 'info');
        }
      }, 'Toggle floating FPS HUD');

      this.registerCommand('unlock-all', () => {
        window.ArcadeCheatEngine.activateCheat('unlockall', 'All perks unlocked.');
        this.println('All achievements and secret perks marked UNLOCKED.', 'success');
      }, 'Unlock all platform perks');
    }

    execute(cmdString) {
      this.println(`> ${cmdString}`, 'prompt');
      const parts = cmdString.split(' ');
      const name = parts[0].toLowerCase();
      const args = parts.slice(1);

      if (this.commands[name]) {
        try {
          this.commands[name].handler(args);
        } catch (err) {
          this.println(`Execution error: ${err.message}`, 'error');
        }
      } else {
        this.println(`Unknown command '${name}'. Type 'help' for command list.`, 'error');
      }
    }
  }

  window.ArcadeDebugTerminal = new DebugTerminal();
})(window);
