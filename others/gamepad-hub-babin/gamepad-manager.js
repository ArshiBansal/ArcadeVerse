/**
 * ArcadeVerse Physical Gamepad Hub - Gamepad Manager
 * 60Hz poll loop monitoring HTML5 Gamepad API connections, buttons, and analog sticks.
 */
(function(window) {
  'use strict';

  class GamepadManager {
    constructor() {
      this.connectedGamepad = null;
      this.gamepadIndex = null;
      this.isPolling = false;
      this.listeners = new Set();
      this.deadzone = 0.15;
      this.init();
    }

    init() {
      window.addEventListener('gamepadconnected', (e) => {
        this.connectedGamepad = e.gamepad;
        this.gamepadIndex = e.gamepad.index;
        this.startPolling();
        window.dispatchEvent(new CustomEvent('arcadeverse:gamepad-connected', {
          detail: { id: e.gamepad.id, index: e.gamepad.index }
        }));
      });

      window.addEventListener('gamepaddisconnected', (e) => {
        if (this.gamepadIndex === e.gamepad.index) {
          this.connectedGamepad = null;
          this.gamepadIndex = null;
          this.stopPolling();
          window.dispatchEvent(new CustomEvent('arcadeverse:gamepad-disconnected', {
            detail: { index: e.gamepad.index }
          }));
        }
      });
    }

    startPolling() {
      if (this.isPolling) return;
      this.isPolling = true;
      this.poll = this.poll.bind(this);
      requestAnimationFrame(this.poll);
    }

    stopPolling() {
      this.isPolling = false;
    }

    poll() {
      if (!this.isPolling) return;

      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gamepads[this.gamepadIndex];

      if (gp) {
        this.connectedGamepad = gp;
        const snapshot = this.readState(gp);
        for (const cb of this.listeners) {
          cb(snapshot);
        }
        window.dispatchEvent(new CustomEvent('arcadeverse:gamepad-state', { detail: snapshot }));
      }

      requestAnimationFrame(this.poll);
    }

    readState(gp) {
      const buttons = gp.buttons.map((b, i) => ({
        index: i,
        pressed: b.pressed,
        value: parseFloat(b.value.toFixed(2))
      }));

      const axes = gp.axes.map(val => {
        const absVal = Math.abs(val);
        return absVal > this.deadzone ? parseFloat(val.toFixed(2)) : 0;
      });

      return {
        id: gp.id,
        index: gp.index,
        buttons,
        axes,
        timestamp: gp.timestamp
      };
    }

    subscribe(callback) {
      this.listeners.add(callback);
      return () => this.listeners.delete(callback);
    }
  }

  window.ArcadeGamepadManager = new GamepadManager();
})(window);
