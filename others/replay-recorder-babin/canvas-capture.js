/**
 * ArcadeVerse Replay Studio - Canvas Capture Engine
 * Captures 60FPS canvas stream using MediaRecorder API with audio mix support.
 */
(function(window) {
  'use strict';

  class CanvasCaptureEngine {
    constructor() {
      this.mediaRecorder = null;
      this.recordedChunks = [];
      this.isRecording = false;
      this.startTime = null;
      this.durationInterval = null;
      this.elapsedSeconds = 0;
      this.onDurationUpdate = null;
      this.onRecordingComplete = null;
    }

    getSupportedMimeType() {
      const types = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=h264',
        'video/webm'
      ];
      for (const t of types) {
        if (MediaRecorder.isTypeSupported(t)) return t;
      }
      return '';
    }

    startRecording(canvas, audioStream = null) {
      if (!canvas) throw new Error('Target canvas element is required for capture.');
      if (this.isRecording) return;

      const videoStream = canvas.captureStream ? canvas.captureStream(60) : null;
      if (!videoStream) throw new Error('canvas.captureStream() is not supported in this browser.');

      let combinedStream = videoStream;
      if (audioStream) {
        combinedStream = new MediaStream([
          ...videoStream.getVideoTracks(),
          ...audioStream.getAudioTracks()
        ]);
      }

      const mimeType = this.getSupportedMimeType();
      const options = mimeType ? { mimeType } : {};

      this.recordedChunks = [];
      this.mediaRecorder = new MediaRecorder(combinedStream, options);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        clearInterval(this.durationInterval);
        const blob = new Blob(this.recordedChunks, { type: mimeType || 'video/webm' });
        if (this.onRecordingComplete) {
          this.onRecordingComplete(blob, this.elapsedSeconds);
        }
      };

      this.mediaRecorder.start(250); // 250ms chunks
      this.isRecording = true;
      this.startTime = Date.now();
      this.elapsedSeconds = 0;

      this.durationInterval = setInterval(() => {
        this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        if (this.onDurationUpdate) {
          this.onDurationUpdate(this.elapsedSeconds);
        }
      }, 1000);
    }

    stopRecording() {
      if (!this.isRecording || !this.mediaRecorder) return;
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  window.ArcadeCanvasCapture = new CanvasCaptureEngine();
})(window);
