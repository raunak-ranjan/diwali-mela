/**
 * High-fidelity Web Audio API Festive Sound Engine
 * Generates procedural festive audio, fireworks, balloon pops, diya lighting chimes,
 * sweet shop coin clinks, and a traditional Indian ambient raga drone synthesizer.
 */

class FestiveSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private isMusicPlaying: boolean = false;
  private musicInterval: any = null;

  constructor() {
    // AudioContext will be initialized upon user gesture
  }

  public init() {
    if (this.ctx || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();

      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.musicGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

      this.sfxGain.connect(this.masterGain);
      this.musicGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  public resume() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(master: number, sfx: number, music: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.masterGain) this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, master)), now);
    if (this.sfxGain) this.sfxGain.gain.setValueAtTime(Math.max(0, Math.min(1, sfx)), now);
    if (this.musicGain) this.musicGain.gain.setValueAtTime(Math.max(0, Math.min(1, music)), now);
  }

  public toggleMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.8, this.ctx.currentTime);
    }
  }

  /**
   * Sound effect: Diya ignited - Warm golden chime
   */
  public playDiyaLight() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const now = this.ctx.currentTime;

    const chords = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    chords.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.001, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.05 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.9);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 1.0);
    });
  }

  /**
   * Sound effect: Balloon Pop - Snappy crack and resonant air release
   */
  public playBalloonPop() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const now = this.ctx.currentTime;

    // Noise burst
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.03));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(3.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain!);

    noise.start(now);
  }

  /**
   * Sound effect: Air rifle shot
   */
  public playShootSound() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain!);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  /**
   * Sound effect: Fireworks rocket whistle and thunderous crackling explosion
   */
  public playFireworkExplosion() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const now = this.ctx.currentTime;

    // 1. Bass boom
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(150, now);
    subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.5);

    subGain.gain.setValueAtTime(0.9, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain!);
    subOsc.start(now);
    subOsc.stop(now + 0.7);

    // 2. Crackling noise
    const bufferSize = this.ctx.sampleRate * 0.8;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // intermittent crackles
      const crackle = Math.random() > 0.94 ? 1.0 : (Math.random() * 0.2 - 0.1);
      data[i] = crackle * Math.exp(-i / (this.ctx.sampleRate * 0.25));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2500, now);
    filter.frequency.exponentialRampToValueAtTime(500, now + 0.8);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain!);
    noise.start(now);
  }

  /**
   * Sound effect: Virtual tokens / Coins clink
   */
  public playTokenEarned() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const now = this.ctx.currentTime;

    const tones = [987.77, 1318.51, 1567.98, 2093.00]; // B5, E6, G6, C7
    tones.forEach((t, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(t, now + i * 0.08);

      gain.gain.setValueAtTime(0.25, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.4);
    });
  }

  /**
   * Ambient Festive Melody: Synthesizes a Raag Yaman / Bhairavi pentatonic festive drone
   */
  public startFestiveMusic() {
    if (this.isMusicPlaying) return;
    this.resume();
    this.isMusicPlaying = true;

    // Raag scale frequencies (Sa Re Ga Ma Pa Dha Ni Sa in C)
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];

    const playNote = () => {
      if (!this.isMusicPlaying || !this.ctx || this.isMuted) return;

      const now = this.ctx.currentTime;
      const freq = scale[Math.floor(Math.random() * scale.length)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle'; // Smooth Indian flute/sitar warmth
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.musicGain!);

      osc.start(now);
      osc.stop(now + 1.3);

      const nextDelay = 350 + Math.random() * 400;
      this.musicInterval = setTimeout(playNote, nextDelay);
    };

    playNote();
  }

  public stopFestiveMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearTimeout(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundEngine = new FestiveSoundEngine();
