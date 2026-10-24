/**
 * ArcadeVerse Virtual Gamepad - Touch Event Dispatcher
 * Injects synthetic KeyboardEvents into the active document or game iframe.
 */
(function(window) {
  'use strict';

  class TouchDispatcher {
    constructor() {
      this.keyMap = {
        ArrowUp: { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38 },
        ArrowDown: { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 },
        ArrowLeft: { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 },
        ArrowRight: { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 },
        Space: { key: ' ', code: 'Space', keyCode: 32 },
        ActionA: { key: 'z', code: 'KeyZ', keyCode: 90 },
        ActionB: { key: 'x', code: 'KeyX', keyCode: 88 }
      };
      this.targetIframe = null;
    }

    setTargetIframe(iframe) {
      this.targetIframe = iframe;
    }

    dispatchKey(keyIdentifier, isDown) {
      const mapping = this.keyMap[keyIdentifier];
      if (!mapping) return;

      const eventType = isDown ? 'keydown' : 'keyup';
      const eventInit = {
        key: mapping.key,
        code: mapping.code,
        keyCode: mapping.keyCode,
        which: mapping.keyCode,
        bubbles: true,
        cancelable: true
      };

      const event = new KeyboardEvent(eventType, eventInit);
      window.dispatchEvent(event);
      document.dispatchEvent(event);

      // If embedded game iframe exists, dispatch directly to its document
      if (this.targetIframe && this.targetIframe.contentWindow) {
        try {
          this.targetIframe.contentWindow.dispatchEvent(new KeyboardEvent(eventType, eventInit));
        } catch (e) {
          // Cross-origin restriction fallback
          this.targetIframe.contentWindow.postMessage({
            type: 'arcadeverse:key-event',
            eventType,
            key: mapping.key,
            code: mapping.code
          }, '*');
        }
      }
    }
  }

  window.ArcadeTouchDispatcher = new TouchDispatcher();
})(window);
