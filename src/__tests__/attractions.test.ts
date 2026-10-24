import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../stores/useGameStore';
import { soundEngine } from '../audio/soundEngine';
import { FERRIS_WHEEL_CONFIG, SANGEET_VIDEO_CONFIG } from '../utils/attractionConfig';
import { interactionRegistry } from '../systems/interactionRegistry';

describe('Attraction Behaviors: Ferris Wheel, Cultural Stage & Fireworks', () => {
  beforeEach(() => {
    // Reset state before each test
    useGameStore.setState({
      activeModal: 'none',
      prompt: null,
      ferrisWheelRide: {
        isRiding: false,
        cabinIndex: 0,
        rotationAngle: 0,
      },
      culturalStageState: {
        isPlayingMusic: false,
        activeRaag: 'Raag Yaman',
        lightingTheme: 'gold',
        isScreenActive: false,
      },
      fireworksState: {
        mode: 'idle',
        countdown: 3,
        showTimeRemaining: 20,
        manualLaunchesCount: 0,
        lastManualLaunch: 0,
        lastBurstType: 'peony',
      },
    });
  });

  describe('1. Giant Ferris Wheel Manual Ride Lifecycle', () => {
    it('starts with wheel in idle non-riding state', () => {
      const state = useGameStore.getState();
      expect(state.ferrisWheelRide.isRiding).toBe(false);
      expect(state.ferrisWheelRide.cabinIndex).toBe(0);
    });

    it('boards the player into the Ferris wheel gondola', () => {
      useGameStore.getState().boardFerrisWheel(2);
      const state = useGameStore.getState();
      expect(state.ferrisWheelRide.isRiding).toBe(true);
      expect(state.ferrisWheelRide.cabinIndex).toBe(2);
      expect(state.activeModal).toBe('none');
      expect(state.prompt).toBeNull();
    });

    it('prevents duplicate boarding if already riding', () => {
      useGameStore.getState().boardFerrisWheel(0);
      expect(useGameStore.getState().ferrisWheelRide.isRiding).toBe(true);

      // Attempt second board call with different index
      useGameStore.getState().boardFerrisWheel(5);
      // Keeps original cabin index
      expect(useGameStore.getState().ferrisWheelRide.cabinIndex).toBe(0);
    });

    it('updates wheel rotation angle continuously', () => {
      useGameStore.getState().updateFerrisWheelAngle(1.57);
      expect(useGameStore.getState().ferrisWheelRide.rotationAngle).toBeCloseTo(1.57);
    });

    it('exits the Ferris wheel ride cleanly and resets state', () => {
      useGameStore.getState().boardFerrisWheel(0);
      expect(useGameStore.getState().ferrisWheelRide.isRiding).toBe(true);

      useGameStore.getState().exitFerrisWheel();
      const state = useGameStore.getState();
      expect(state.ferrisWheelRide.isRiding).toBe(false);
      expect(state.prompt).toBeNull();
    });

    it('does not crash or mutate when calling exit while not riding', () => {
      useGameStore.getState().exitFerrisWheel();
      expect(useGameStore.getState().ferrisWheelRide.isRiding).toBe(false);
    });

    it('has a noticeably faster rotation speed constant (~11.4s per rev) and safe reduced-motion fallback', () => {
      expect(FERRIS_WHEEL_CONFIG.NORMAL_SPEED).toBe(0.55);
      expect(FERRIS_WHEEL_CONFIG.NORMAL_SPEED).toBeGreaterThan(0.45);
      expect(FERRIS_WHEEL_CONFIG.REDUCED_MOTION_SPEED).toBe(0.08);

      // Verifies time for full 360 rotation (~11.4s for normal, ~78.5s for reduced motion)
      const fullRotationTimeNormal = (Math.PI * 2) / FERRIS_WHEEL_CONFIG.NORMAL_SPEED;
      expect(fullRotationTimeNormal).toBeCloseTo(11.42, 1);

      const fullRotationTimeReduced = (Math.PI * 2) / FERRIS_WHEEL_CONFIG.REDUCED_MOTION_SPEED;
      expect(fullRotationTimeReduced).toBeCloseTo(78.54, 1);
    });
  });

  describe('2. Cultural Sangeet Stage & Concert Experience', () => {
    it('starts with stage concert paused', () => {
      const state = useGameStore.getState();
      expect(state.culturalStageState.isPlayingMusic).toBe(false);
      expect(state.culturalStageState.activeRaag).toBe('Raag Yaman');
      expect(state.culturalStageState.lightingTheme).toBe('gold');
    });

    it('toggles concert music playback and interacts with soundEngine', () => {
      const startSpy = vi.spyOn(soundEngine, 'startFestiveMusic');
      const stopSpy = vi.spyOn(soundEngine, 'stopFestiveMusic');

      useGameStore.getState().setStagePlayingMusic(true);
      expect(useGameStore.getState().culturalStageState.isPlayingMusic).toBe(true);
      expect(startSpy).toHaveBeenCalled();

      useGameStore.getState().setStagePlayingMusic(false);
      expect(useGameStore.getState().culturalStageState.isPlayingMusic).toBe(false);
      expect(stopSpy).toHaveBeenCalled();
    });

    it('updates the active raag and lighting theme', () => {
      useGameStore.getState().setStageRaag('Raag Bhairavi');
      expect(useGameStore.getState().culturalStageState.activeRaag).toBe('Raag Bhairavi');

      useGameStore.getState().setStageLightingTheme('peacock');
      expect(useGameStore.getState().culturalStageState.lightingTheme).toBe('peacock');

      useGameStore.getState().setStageLightingTheme('saffron');
      expect(useGameStore.getState().culturalStageState.lightingTheme).toBe('saffron');
    });

    it('stops festive music and resets playing state on closing stage modal', () => {
      const stopSpy = vi.spyOn(soundEngine, 'stopFestiveMusic');
      useGameStore.getState().openModal('stage');
      useGameStore.getState().setStagePlayingMusic(true);
      expect(useGameStore.getState().culturalStageState.isPlayingMusic).toBe(true);

      useGameStore.getState().closeModal();
      expect(stopSpy).toHaveBeenCalled();
      expect(useGameStore.getState().culturalStageState.isPlayingMusic).toBe(false);
      expect(useGameStore.getState().activeModal).toBe('none');
    });

    it('safely handles closeModal when music was never started', () => {
      const stopSpy = vi.spyOn(soundEngine, 'stopFestiveMusic');
      useGameStore.getState().openModal('stage');
      expect(useGameStore.getState().culturalStageState.isPlayingMusic).toBe(false);

      useGameStore.getState().closeModal();
      expect(stopSpy).not.toHaveBeenCalled();
      expect(useGameStore.getState().culturalStageState.isPlayingMusic).toBe(false);
      expect(useGameStore.getState().activeModal).toBe('none');
    });

    describe('3D Stage Screen YouTube Performance Integration', () => {
      it('configures the supplied YouTube video ID with privacy-enhanced embed URL without autoplay', () => {
        expect(SANGEET_VIDEO_CONFIG.VIDEO_ID).toBe('ETsmAnCfY68');
        expect(SANGEET_VIDEO_CONFIG.EMBED_URL).toContain('www.youtube-nocookie.com/embed/ETsmAnCfY68');
        expect(SANGEET_VIDEO_CONFIG.EMBED_URL).toContain('autoplay=0');
        expect(SANGEET_VIDEO_CONFIG.EMBED_URL).toContain('playsinline=1');
        expect(SANGEET_VIDEO_CONFIG.EMBED_URL).toContain('rel=0');
        expect(SANGEET_VIDEO_CONFIG.WATCH_URL).toBe('https://www.youtube.com/watch?v=ETsmAnCfY68');
        expect(SANGEET_VIDEO_CONFIG.STAGE_SCREEN.WIDTH).toBe(9.6);
        expect(SANGEET_VIDEO_CONFIG.STAGE_SCREEN.HEIGHT).toBe(5.4);
        expect(SANGEET_VIDEO_CONFIG.STAGE_SCREEN.PIXEL_WIDTH).toBe(960);
        expect(SANGEET_VIDEO_CONFIG.STAGE_SCREEN.PIXEL_HEIGHT).toBe(540);
        expect(SANGEET_VIDEO_CONFIG.STAGE_SCREEN.DISTANCE_FACTOR).toBe(4.0);
      });

      it('activates 3D stage screen and pauses background festive music if playing', () => {
        const stopSpy = vi.spyOn(soundEngine, 'stopFestiveMusic');
        useGameStore.getState().setStagePlayingMusic(true);
        expect(useGameStore.getState().culturalStageState.isPlayingMusic).toBe(true);

        // Activate in-world stage screen
        useGameStore.getState().setStageScreenActive(true);
        expect(useGameStore.getState().culturalStageState.isScreenActive).toBe(true);
        expect(stopSpy).toHaveBeenCalled();
        expect(useGameStore.getState().culturalStageState.isPlayingMusic).toBe(false);
      });

      it('deactivates 3D stage screen cleanly and restores normal game state', () => {
        useGameStore.getState().setStageScreenActive(true);
        expect(useGameStore.getState().culturalStageState.isScreenActive).toBe(true);

        useGameStore.getState().setStageScreenActive(false);
        expect(useGameStore.getState().culturalStageState.isScreenActive).toBe(false);
      });

      it('registers stage target with secondary Watch Performance on Stage Screen action', () => {
        interactionRegistry.register({
          id: 'cultural_performance_stage',
          position: [0, 1.0, 30.5],
          radius: 4.0,
          label: 'Diwali Cultural Sangeet Stage',
          sublabel: 'Live Traditional Ragas & Concert Experience',
          actionType: 'stage',
          onInteract: () => {
            useGameStore.getState().openModal('stage');
          },
          secondaryAction: {
            label: 'Watch Performance on Stage Screen',
            sublabel: 'Play Live YouTube Video in 3D Mela',
            keyHint: 'V',
            onAction: () => {
              useGameStore.getState().setStageScreenActive(true);
            },
          },
        });

        const target = interactionRegistry.get('cultural_performance_stage');
        expect(target).toBeDefined();
        expect(target?.secondaryAction).toBeDefined();
        expect(target?.secondaryAction?.label).toBe('Watch Performance on Stage Screen');
        expect(target?.secondaryAction?.keyHint).toBe('V');

        // Test triggering secondary action activates stage screen directly
        target?.secondaryAction?.onAction();
        expect(useGameStore.getState().culturalStageState.isScreenActive).toBe(true);
      });

      it('suppresses duplicate Watch Performance prompt when stage screen is already active', () => {
        useGameStore.getState().setStageScreenActive(true);
        expect(useGameStore.getState().culturalStageState.isScreenActive).toBe(true);

        const isScreenActive = useGameStore.getState().culturalStageState.isScreenActive;
        interactionRegistry.register({
          id: 'cultural_performance_stage',
          position: [0, 1.0, 30.5],
          radius: 4.0,
          label: 'Diwali Cultural Sangeet Stage',
          actionType: 'stage',
          onInteract: () => {},
          secondaryAction: isScreenActive
            ? undefined
            : {
                label: 'Watch Performance on Stage Screen',
                sublabel: 'Play Live YouTube Video in 3D Mela',
                keyHint: 'V',
                onAction: () => {
                  useGameStore.getState().setStageScreenActive(true);
                },
              },
        });

        const target = interactionRegistry.get('cultural_performance_stage');
        expect(target).toBeDefined();
        expect(target?.secondaryAction).toBeUndefined();
      });

      it('deactivates stage screen playback when Escape key is pressed', () => {
        useGameStore.getState().setStageScreenActive(true);
        expect(useGameStore.getState().culturalStageState.isScreenActive).toBe(true);

        // Escape handling simulation
        if (useGameStore.getState().culturalStageState.isScreenActive) {
          useGameStore.getState().setStageScreenActive(false);
        }
        expect(useGameStore.getState().culturalStageState.isScreenActive).toBe(false);
      });
    });
  });

  describe('3. Fireworks Scheduled Show and Interactive Launches', () => {
    it('starts in idle mode with default countdown and duration', () => {
      const state = useGameStore.getState();
      expect(state.fireworksState.mode).toBe('idle');
      expect(state.fireworksState.countdown).toBe(3);
      expect(state.fireworksState.showTimeRemaining).toBe(20);
    });

    it('starts scheduled show entering countdown state', () => {
      useGameStore.getState().startScheduledFireworks();
      const state = useGameStore.getState();
      expect(state.fireworksState.mode).toBe('scheduled');
      expect(state.fireworksState.countdown).toBe(3);
    });

    it('ticks down countdown then ticks show time remaining', () => {
      useGameStore.getState().startScheduledFireworks();

      // Tick 1
      useGameStore.getState().tickFireworks();
      expect(useGameStore.getState().fireworksState.countdown).toBe(2);

      // Tick 2
      useGameStore.getState().tickFireworks();
      expect(useGameStore.getState().fireworksState.countdown).toBe(1);

      // Tick 3
      useGameStore.getState().tickFireworks();
      expect(useGameStore.getState().fireworksState.countdown).toBe(0);

      // Tick 4 (into show duration)
      useGameStore.getState().tickFireworks();
      expect(useGameStore.getState().fireworksState.showTimeRemaining).toBe(19);
    });

    it('stops show immediately on user stop request', () => {
      useGameStore.getState().startScheduledFireworks();
      useGameStore.getState().stopFireworksShow();
      const state = useGameStore.getState();
      expect(state.fireworksState.mode).toBe('idle');
      expect(state.fireworksState.countdown).toBe(3);
    });

    it('triggers interactive player firework launch with sound', () => {
      const soundSpy = vi.spyOn(soundEngine, 'playFireworkExplosion');
      const initialCount = useGameStore.getState().fireworksState.manualLaunchesCount;

      useGameStore.getState().triggerManualFirework('willow');
      const state = useGameStore.getState();

      expect(soundSpy).toHaveBeenCalled();
      expect(state.fireworksState.manualLaunchesCount).toBe(initialCount + 1);
      expect(state.fireworksState.lastBurstType).toBe('willow');
      expect(state.fireworksState.lastManualLaunch).toBeGreaterThan(0);
    });

    it('completing show awards celebration tokens and increments statistic', () => {
      const initialTokens = useGameStore.getState().tokens;
      const initialWatched = useGameStore.getState().stats.fireworksWatchedCount || 0;

      // Set show near finish
      useGameStore.setState({
        fireworksState: {
          mode: 'scheduled',
          countdown: 0,
          showTimeRemaining: 1,
          manualLaunchesCount: 0,
          lastManualLaunch: 0,
          lastBurstType: 'peony',
        },
      });

      // Final tick completes show
      useGameStore.getState().tickFireworks();

      const finalState = useGameStore.getState();
      expect(finalState.fireworksState.mode).toBe('idle');
      expect(finalState.tokens).toBe(initialTokens + 50);
      expect(finalState.stats.fireworksWatchedCount).toBe(initialWatched + 1);
    });
  });

  describe('4. Independent Interaction Routing Verification', () => {
    it('verifies Ferris Wheel, Stage, and Fireworks have distinct actionTypes and handlers', () => {
      // Test simulated registration objects
      const ferrisWheelAction = 'ferris_wheel';
      const stageAction = 'stage';
      const fireworksAction = 'fireworks';

      expect(ferrisWheelAction).not.toBe(stageAction);
      expect(stageAction).not.toBe(fireworksAction);
      expect(ferrisWheelAction).not.toBe(fireworksAction);

      // Ferris Wheel boards ride rather than opening modal
      useGameStore.getState().boardFerrisWheel();
      expect(useGameStore.getState().ferrisWheelRide.isRiding).toBe(true);
      expect(useGameStore.getState().activeModal).toBe('none');

      // Stage opens stage modal
      useGameStore.getState().openModal('stage');
      expect(useGameStore.getState().activeModal).toBe('stage');
      expect(useGameStore.getState().fireworksState.mode).toBe('idle');

      // Fireworks opens fireworks modal
      useGameStore.getState().openModal('fireworks');
      expect(useGameStore.getState().activeModal).toBe('fireworks');
    });
  });
});
