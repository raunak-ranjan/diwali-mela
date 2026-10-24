import { computeSpatialAudioGain } from '../systems/environmentMath';
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
  private ambientGain: GainNode | null = null;
  private bazaarGain: GainNode | null = null;
  private plazaGain: GainNode | null = null;
  private carnivalGain: GainNode | null = null;
  private stageGain: GainNode | null = null;
  private isSpatialAudioActive: boolean = false;
  private spatialAudioSources: any[] = [];
  private lastListenerUpdate: number = 0;

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
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

    } catch {
      console.warn('Web Audio API not supported or blocked:');
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
   * Sound effect: Sacred Diya collected - Ethereal, shimmering resonant chord
   */
  public playQuestChime() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const now = this.ctx.currentTime;

    // Resonant shimmering chord in E major (E5, G#5, B5, E6, G#6)
    const tones = [659.25, 830.61, 987.77, 1318.51, 1661.22];
    tones.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.001, now + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 1.1);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 1.2);
    });
  }

  /**
   * Sound effect: Quest Complete Fanfare - Grand victorious festive celebration
   */
  public playQuestComplete() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const now = this.ctx.currentTime;

    // Victorious fanfare: G4 -> C5 -> E5 -> G5 -> C6
    const fanfare = [
      { freq: 392.00, time: 0.00, dur: 0.18 },
      { freq: 523.25, time: 0.14, dur: 0.18 },
      { freq: 659.25, time: 0.28, dur: 0.18 },
      { freq: 783.99, time: 0.42, dur: 0.25 },
      { freq: 1046.50, time: 0.60, dur: 1.40 },
    ];

    fanfare.forEach((note) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      gain.gain.setValueAtTime(0.001, now + note.time);
      gain.gain.linearRampToValueAtTime(0.3, now + note.time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.dur);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur + 0.1);
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

  /**
   * Sound effect: Equip/unequip cosmetic item - soft melodic bell tone
   */
  public playEquipSound() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain!);

    osc.start(now);
    osc.stop(now + 0.38);
  }

  /**
   * Sound effect: Purchase cosmetic unlock - celebratory bright double chime
   */
  public playPurchaseSuccess() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const now = this.ctx.currentTime;
    const notes = [587.33, 880.00, 1174.66]; // D5, A5, D6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.22, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.45);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.5);
    });
  }

  /**
   * Sound effect: Action rejected (e.g. insufficient funds) - gentle low double thud
   */
  public playErrorSound() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now); // A3
    osc.frequency.setValueAtTime(180, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain!);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  /**
   * Initializes procedural spatial sound zones for bazaar murmur, temple plaza, carnival, and stage.
   * Runs only after user interaction and respects browser autoplay policies.
   */
  public startSpatialZones() {
    if (!this.ctx || this.isSpatialAudioActive) return;
    this.resume();
    this.isSpatialAudioActive = true;

    try {
      const now = this.ctx.currentTime;

      // 1. Zone Gains
      this.bazaarGain = this.ctx.createGain();
      this.plazaGain = this.ctx.createGain();
      this.carnivalGain = this.ctx.createGain();
      this.stageGain = this.ctx.createGain();

      [this.bazaarGain, this.plazaGain, this.carnivalGain, this.stageGain].forEach((g) => {
        g.gain.setValueAtTime(0.001, now);
        g.connect(this.ambientGain!);
      });

      // 2. Bazaar Ambient Murmur (Filtered noise simulating crowd buzz & sizzling stalls)
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Pink-like filter
        lastOut = (lastOut * 0.95) + (white * 0.05);
        data[i] = lastOut;
      }

      const bazaarSource = this.ctx.createBufferSource();
      bazaarSource.buffer = noiseBuffer;
      bazaarSource.loop = true;

      const bazaarFilter = this.ctx.createBiquadFilter();
      bazaarFilter.type = 'bandpass';
      bazaarFilter.frequency.setValueAtTime(450, now);
      bazaarFilter.Q.setValueAtTime(1.8, now);

      bazaarSource.connect(bazaarFilter);
      bazaarFilter.connect(this.bazaarGain);
      bazaarSource.start();
      this.spatialAudioSources.push(bazaarSource);

      // 3. Central Plaza Temple Bells & Shimmer (Soft periodic resonant drone)
      const plazaDrone = this.ctx.createOscillator();
      plazaDrone.type = 'triangle';
      plazaDrone.frequency.setValueAtTime(220, now); // A3 drone harmonic

      const plazaFilter = this.ctx.createBiquadFilter();
      plazaFilter.type = 'lowpass';
      plazaFilter.frequency.setValueAtTime(600, now);

      plazaDrone.connect(plazaFilter);
      plazaFilter.connect(this.plazaGain);
      plazaDrone.start();
      this.spatialAudioSources.push(plazaDrone);

      // 4. Carnival Ferris Wheel Whirl (Gentle warm mechanical rhythm)
      const carnivalDrone = this.ctx.createOscillator();
      carnivalDrone.type = 'sine';
      carnivalDrone.frequency.setValueAtTime(146.83, now); // D3 warm carnival root

      carnivalDrone.connect(this.carnivalGain);
      carnivalDrone.start();
      this.spatialAudioSources.push(carnivalDrone);

      // 5. Cultural Stage Tanpura Resonance
      const stageDrone = this.ctx.createOscillator();
      stageDrone.type = 'sawtooth';
      stageDrone.frequency.setValueAtTime(130.81, now); // C3 deep resonance

      const stageFilter = this.ctx.createBiquadFilter();
      stageFilter.type = 'lowpass';
      stageFilter.frequency.setValueAtTime(320, now);

      stageDrone.connect(stageFilter);
      stageFilter.connect(this.stageGain);
      stageDrone.start();
      this.spatialAudioSources.push(stageDrone);
    } catch {
      console.warn('Failed to initialize spatial audio zones:');
    }
  }

  /**
   * Updates positional attenuation of sound zones based on player coordinates.
   * Throttled to avoid excessive Web Audio node recalculations.
   */
  public updateListenerPosition(x: number, y: number, z: number) {
    if (!this.ctx || !this.isSpatialAudioActive || this.isMuted) return;

    const now = this.ctx.currentTime;
    if (now - this.lastListenerUpdate < 0.08) return;
    this.lastListenerUpdate = now;

    const listenerPos: [number, number, number] = [x, y, z];

    // Compute zone gains using cosine distance roll-off
    const gBazaar = computeSpatialAudioGain(listenerPos, [-12.5, 0, 0], 5.0, 26.0) * 0.22;
    const gPlaza = computeSpatialAudioGain(listenerPos, [0, 0, 0], 6.0, 28.0) * 0.18;
    const gCarnival = computeSpatialAudioGain(listenerPos, [20, 0, 18], 7.0, 30.0) * 0.20;
    const gStage = computeSpatialAudioGain(listenerPos, [0, 0, 32], 6.0, 26.0) * 0.24;

    const timeConstant = 0.05;
    if (this.bazaarGain) this.bazaarGain.gain.setTargetAtTime(gBazaar, now, timeConstant);
    if (this.plazaGain) this.plazaGain.gain.setTargetAtTime(gPlaza, now, timeConstant);
    if (this.carnivalGain) this.carnivalGain.gain.setTargetAtTime(gCarnival, now, timeConstant);
    if (this.stageGain) this.stageGain.gain.setTargetAtTime(gStage, now, timeConstant);
  }

  /**
   * Disposes spatial audio nodes on shutdown
   */
  public stopSpatialZones() {
    this.isSpatialAudioActive = false;
    this.spatialAudioSources.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch {
        // ignore
      }
    });
    this.spatialAudioSources = [];

  /**
   * Sound effect: Visitor greeting - Warm festive sitar/glockenspiel chord chime
   */
  public playVisitorGreeting() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const now = this.ctx.currentTime;
    const notes = [659.25, 830.61, 987.77, 1318.5]; // E5, G#5, B5, E6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.001, now + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.65);
    });
  }

  /**
   * Sound effect: Crowd applause & festive cheer
   */
  public playCrowdApplause() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const now = this.ctx.currentTime;

    // Generate gentle burst of rhythmic handclaps via bandpass filtered noise
    const bufferSize = Math.floor(this.ctx.sampleRate * 1.2);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.45));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(1.8, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain!);

    noise.start(now);
    noise.stop(now + 1.2);
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
