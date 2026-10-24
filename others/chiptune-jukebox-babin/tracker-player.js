/**
 * ArcadeVerse Chiptune Jukebox - Track Sequencer Player
 * Plays procedural multi-channel chiptune melodies with tempo control.
 */
(function(window) {
  'use strict';

  const NOTE_FREQS = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
    REST: 0
  };

  const TRACKS = [
    {
      id: 'neon-horizon',
      title: 'Neon Horizon Odyssey',
      bpm: 130,
      lead: ['C4', 'E4', 'G4', 'B4', 'C5', 'B4', 'G4', 'E4', 'A4', 'C5', 'E5', 'D5', 'B4', 'G4', 'A4', 'REST'],
      bass: ['C3', 'REST', 'C3', 'REST', 'A3', 'REST', 'A3', 'REST', 'F3', 'REST', 'F3', 'REST', 'G3', 'REST', 'G3', 'REST'],
      drums: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1]
    },
    {
      id: 'cyber-panic',
      title: 'Cyberpunk Boss Rush',
      bpm: 145,
      lead: ['E4', 'G4', 'A4', 'B4', 'E5', 'B4', 'A4', 'G4', 'D5', 'C5', 'B4', 'A4', 'G4', 'E4', 'F4', 'G4'],
      bass: ['E3', 'E3', 'G3', 'E3', 'A3', 'A3', 'C4', 'A3', 'D3', 'D3', 'F3', 'D3', 'B3', 'B3', 'D4', 'B3'],
      drums: [1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1]
    }
  ];

  class TrackerPlayer {
    constructor() {
      this.synth = window.ArcadeChiptuneSynth;
      this.currentTrack = TRACKS[0];
      this.isPlaying = false;
      this.step = 0;
      this.timerId = null;
      this.onTrackChange = null;
      this.onStep = null;
    }

    getTracks() {
      return TRACKS;
    }

    selectTrack(id) {
      const found = TRACKS.find(t => t.id === id);
      if (found) {
        this.stop();
        this.currentTrack = found;
        if (this.onTrackChange) this.onTrackChange(this.currentTrack);
      }
    }

    play() {
      if (this.isPlaying) return;
      this.synth.ensureContext();
      this.isPlaying = true;
      this.step = 0;

      const stepDurationMs = (60 / this.currentTrack.bpm / 4) * 1000;
      this.timerId = setInterval(() => this.tick(), stepDurationMs);
    }

    stop() {
      if (!this.isPlaying) return;
      clearInterval(this.timerId);
      this.isPlaying = false;
      this.step = 0;
    }

    tick() {
      const len = this.currentTrack.lead.length;
      const curStep = this.step % len;

      const leadNote = this.currentTrack.lead[curStep];
      const bassNote = this.currentTrack.bass[curStep];
      const isDrum = this.currentTrack.drums[curStep];

      if (leadNote && NOTE_FREQS[leadNote]) {
        this.synth.playNote(NOTE_FREQS[leadNote], 'square', 0.18);
      }
      if (bassNote && NOTE_FREQS[bassNote]) {
        this.synth.playNote(NOTE_FREQS[bassNote], 'triangle', 0.22);
      }
      if (isDrum) {
        this.synth.playNoise(0.06);
      }

      if (this.onStep) this.onStep(curStep, len);
      this.step++;
    }
  }

  window.ArcadeTrackerPlayer = new TrackerPlayer();
})(window);
