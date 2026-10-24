/**
 * ArcadeVerse Physical Gamepad Hub - DualRumble Haptic Actuator
 * Triggers Dual-Shock vibration motors on Xbox / PlayStation / USB controllers.
 */
(function(window) {
  'use strict';

  class HapticRumble {
    constructor() {
      this.manager = window.ArcadeGamepadManager;
    }

    async pulse(duration = 200, strongMagnitude = 0.6, weakMagnitude = 0.4) {
      if (!this.manager || !this.manager.connectedGamepad) return false;
      const gp = this.manager.connectedGamepad;

      if (gp.vibrationActuator && typeof gp.vibrationActuator.playEffect === 'function') {
        try {
          await gp.vibrationActuator.playEffect('dual-rumble', {
            startDelay: 0,
            duration: duration,
            weakMagnitude: weakMagnitude,
            strongMagnitude: strongMagnitude
          });
          return true;
        } catch (e) {
          console.warn('Vibration effect error:', e);
          return false;
        }
      }
      return false;
    }

    triggerEffect(effectName) {
      switch (effectName) {
        case 'damage':
          return this.pulse(300, 0.9, 0.5);
        case 'hit':
          return this.pulse(120, 0.5, 0.8);
        case 'pickup':
          return this.pulse(80, 0.1, 0.4);
        case 'explosion':
          return this.pulse(600, 1.0, 0.9);
        default:
          return this.pulse(150, 0.5, 0.5);
      }
    }
  }

  window.ArcadeHapticRumble = new HapticRumble();
})(window);
