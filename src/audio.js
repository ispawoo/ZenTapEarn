// Web Audio API Procedural Sound Synthesis Engine for Zen Tap
// Synthesizes extremely lightweight, zero-latency calming sounds programmatically.
// Avoids heavy static assets to load the app in under 2 seconds.

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.ambientOsc1 = null;
    this.ambientOsc2 = null;
    this.ambientFilter = null;
    this.ambientGain = null;
    this.isPlayingAmbient = false;
    this.soundEnabled = true;
    this.ambientVolume = 0.15; // Soft background ambient level
    this.currentMode = 'bubble';
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
  }

  resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
    if (!enabled) {
      this.stopAmbient();
    } else if (this.isPlayingAmbient) {
      // Re-trigger/resume ambient
      this.startAmbient(this.currentMode);
    }
  }

  toggleAmbient(mode) {
    this.currentMode = mode;
    if (!this.soundEnabled) return;
    this.startAmbient(mode);
  }

  // Play Sound Effects based on modes
  playPop() {
    if (!this.soundEnabled) return;
    this.resume();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    const now = this.ctx.currentTime;
    
    // Bubble sound: fast frequency sweep from low to high (pop feel)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  playRaindrop() {
    if (!this.soundEnabled) return;
    this.resume();
    if (!this.ctx) return;

    // Rain drop: soft organic double-click resonant sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.12);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(5, now);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  playLeafRustle() {
    if (!this.soundEnabled) return;
    this.resume();
    if (!this.ctx) return;

    // Leaf: beautiful soft chime/rustle using a frequency mix
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 987.77]; // C5, E5, G5, B5 soft chord
    const selectedNote = notes[Math.floor(Math.random() * notes.length)];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(selectedNote, now);
    // Slight vibrato/wind sway effect
    osc.frequency.linearRampToValueAtTime(selectedNote - 10, now + 0.4);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  playFireflyGlow() {
    if (!this.soundEnabled) return;
    this.resume();
    if (!this.ctx) return;

    // Firefly absorption: Soft dreamy rising frequency chime
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const delay = this.ctx.createDelay();
    const delayGain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    // Create soft echo/delay
    gain.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(this.ctx.destination);

    delay.delayTime.setValueAtTime(0.15, this.ctx.currentTime);
    delayGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    const now = this.ctx.currentTime;
    const baseFreq = 880 + Math.random() * 440; // High frequency shimmering chime A5 to E6

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.35);

    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  playChime() {
    if (!this.soundEnabled) return;
    this.resume();
    if (!this.ctx) return;

    // General high-quality reward/success chime chord
    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.0, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.06 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.8);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.9);
    });
  }

  // Beautiful Ambient Synthesizer for constant relaxing drone
  startAmbient(mode = 'bubble') {
    this.resume();
    if (!this.ctx || !this.soundEnabled) return;
    
    this.stopAmbient();
    this.isPlayingAmbient = true;
    this.currentMode = mode;

    const now = this.ctx.currentTime;

    // Create high-cut filter for very warm, soft drone sound
    this.ambientFilter = this.ctx.createBiquadFilter();
    this.ambientFilter.type = 'lowpass';
    this.ambientFilter.frequency.setValueAtTime(320, now); // Warm mud cut

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0, now);
    this.ambientGain.gain.linearRampToValueAtTime(this.ambientVolume, now + 2.0); // Slow fade-in

    // Set frequencies based on selected mode (different calming chords)
    // Mode-based base frequencies
    let freq1 = 110.00; // A2
    let freq2 = 164.81; // E3 (fifth)
    
    if (mode === 'rain') {
      freq1 = 97.99;  // G2
      freq2 = 146.83; // D3 (fifth)
    } else if (mode === 'nature') {
      freq1 = 130.81; // C3
      freq2 = 196.00; // G3
    } else if (mode === 'night') {
      freq1 = 87.31;  // F2
      freq2 = 130.81; // C3
    }

    // Oscillator 1: Deep slow warmth
    this.ambientOsc1 = this.ctx.createOscillator();
    this.ambientOsc1.type = 'triangle';
    this.ambientOsc1.frequency.setValueAtTime(freq1, now);
    
    // Slow drift of frequency for organic feeling
    this.ambientOsc1.frequency.linearRampToValueAtTime(freq1 + 1, now + 10);
    this.ambientOsc1.frequency.linearRampToValueAtTime(freq1 - 0.5, now + 20);

    // Oscillator 2: Fifth chord sway
    this.ambientOsc2 = this.ctx.createOscillator();
    this.ambientOsc2.type = 'sine';
    this.ambientOsc2.frequency.setValueAtTime(freq2, now);
    this.ambientOsc2.frequency.linearRampToValueAtTime(freq2 - 1.5, now + 12);
    this.ambientOsc2.frequency.linearRampToValueAtTime(freq2 + 1, now + 24);

    // Connect them
    this.ambientOsc1.connect(this.ambientFilter);
    this.ambientOsc2.connect(this.ambientFilter);
    this.ambientFilter.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);

    // Start
    this.ambientOsc1.start(now);
    this.ambientOsc2.start(now);

    // Set up a simple slow LFO for volume breathing
    this.scheduleBreathingGain();
  }

  scheduleBreathingGain() {
    if (!this.isPlayingAmbient || !this.ambientGain || !this.ctx) return;
    
    const now = this.ctx.currentTime;
    // Breathe amplitude up and down over 8-second periods
    this.ambientGain.gain.linearRampToValueAtTime(this.ambientVolume * 1.3, now + 4);
    this.ambientGain.gain.linearRampToValueAtTime(this.ambientVolume * 0.7, now + 8);
    
    // Schedule next breath cycle
    this.breathingTimeout = setTimeout(() => {
      this.scheduleBreathingGain();
    }, 8000);
  }

  stopAmbient() {
    this.isPlayingAmbient = false;
    clearTimeout(this.breathingTimeout);
    
    const stopOsc = (osc) => {
      try {
        if (osc) {
          osc.stop();
          osc.disconnect();
        }
      } catch (e) {}
    };

    const fadeGain = this.ambientGain;
    const osc1 = this.ambientOsc1;
    const osc2 = this.ambientOsc2;

    if (fadeGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        fadeGain.gain.cancelScheduledValues(now);
        fadeGain.gain.setValueAtTime(fadeGain.gain.value, now);
        fadeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5); // Fast fade out
        setTimeout(() => {
          stopOsc(osc1);
          stopOsc(osc2);
          try {
            if (fadeGain) fadeGain.disconnect();
          } catch(e){}
        }, 600);
      } catch (e) {
        stopOsc(osc1);
        stopOsc(osc2);
      }
    } else {
      stopOsc(osc1);
      stopOsc(osc2);
    }

    this.ambientOsc1 = null;
    this.ambientOsc2 = null;
    this.ambientGain = null;
    this.ambientFilter = null;
  }
}

export const audio = new AudioEngine();
