/**
 * ArcadeVerse Replay Studio - Clip Exporter
 * Manages video blob URLs, video download triggering, and gallery card creation.
 */
(function(window) {
  'use strict';

  class ClipExporter {
    downloadClip(blob, customName = null) {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const timeTag = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const filename = customName || `ArcadeVerse_Replay_${timeTag}.webm`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }

    createVideoPreview(blob) {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(blob);
      video.controls = true;
      video.autoplay = false;
      video.className = 'studio-preview-video';
      return video;
    }
  }

  window.ArcadeClipExporter = new ClipExporter();
})(window);
