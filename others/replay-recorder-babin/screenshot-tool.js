/**
 * ArcadeVerse Replay Studio - High-Resolution Screenshot Tool
 * Captures clean snapshots from HTML5 Canvas with optional watermarking.
 */
(function(window) {
  'use strict';

  class ScreenshotTool {
    captureSnapshot(canvas, options = {}) {
      if (!canvas) return null;
      const { watermark = true, title = 'ArcadeVerse', score = null } = options;

      // Create offscreen canvas for rendering watermark
      const offscreen = document.createElement('canvas');
      offscreen.width = canvas.width;
      offscreen.height = canvas.height;
      const ctx = offscreen.getContext('2d');

      // Draw original canvas
      ctx.drawImage(canvas, 0, 0);

      if (watermark) {
        // Watermark background pill
        const pad = 16;
        const pillWidth = 200;
        const pillHeight = 36;
        const pillX = offscreen.width - pillWidth - pad;
        const pillY = offscreen.height - pillHeight - pad;

        ctx.fillStyle = 'rgba(11, 14, 20, 0.75)';
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = '600 13px sans-serif';
        ctx.fillStyle = '#00f0ff';
        ctx.fillText(title, pillX + 14, pillY + 22);

        if (score !== null) {
          ctx.fillStyle = '#fff';
          ctx.fillText(`Score: ${score}`, pillX + 110, pillY + 22);
        }
      }

      return offscreen.toDataURL('image/png');
    }

    downloadSnapshot(dataUrl, filename = 'ArcadeVerse_Snapshot.png') {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  window.ArcadeScreenshotTool = new ScreenshotTool();
})(window);
