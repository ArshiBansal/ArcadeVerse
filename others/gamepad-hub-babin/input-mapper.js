/**
 * ArcadeVerse Physical Gamepad Hub - Controller Input Mapper
 * Translates standard Gamepad API buttons and axes to synthetic KeyboardEvents for games.
 */
(function(window) {
  'use strict';

  class GamepadInputMapper {
    constructor() {
      this.buttonStates = new Map();
      this.axisStates = { x: 0, y: 0 };
      this.enabled = true;
      this.init();
    }

    init() {
      if (!window.ArcadeGamepadManager) return;
      window.ArcadeGamepadManager.subscribe((state) => {
        if (!this.enabled) return;
        this.processGamepadState(state);
      });
    }

    processGamepadState(state) {
      // Standard Mapping:
      // Button 0: A (Space / Jump)
      // Button 1: B (Action / Shoot)
      // Button 12: D-Pad Up
      // Button 13: D-Pad Down
      // Button 14: D-Pad Left
      // Button 15: D-Pad Right
      const mappings = [
        { btnIndex: 0, key: ' ', code: 'Space', keyCode: 32 },
        { btnIndex: 1, key: 'z', code: 'KeyZ', keyCode: 90 },
        { btnIndex: 12, key: 'ArrowUp', code: 'ArrowUp', keyCode: 38 },
        { btnIndex: 13, key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 },
        { btnIndex: 14, key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 },
        { btnIndex: 15, key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 }
      ];

      mappings.forEach(m => {
        const btn = state.buttons[m.btnIndex];
        const isPressed = btn ? btn.pressed : false;
        const prevPressed = this.buttonStates.get(m.btnIndex) || false;

        if (isPressed !== prevPressed) {
          this.buttonStates.set(m.btnIndex, isPressed);
          this.dispatchKey(m.key, m.code, m.keyCode, isPressed);
        }
      });
    }

    dispatchKey(key, code, keyCode, isDown) {
      const eventType = isDown ? 'keydown' : 'keyup';
      const event = new KeyboardEvent(eventType, {
        key,
        code,
        keyCode,
        which: keyCode,
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(event);
      document.dispatchEvent(event);
    }
  }

  window.ArcadeGamepadInputMapper = new GamepadInputMapper();
})(window);
