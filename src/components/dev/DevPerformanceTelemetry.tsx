import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '../../stores/useGameStore';
import { useInputStore } from '../../stores/useInputStore';
import { useNpcStore } from '../../stores/useNpcStore';
import {
  calculate1PercentLowFps,
  type PerformanceSnapshot,
  type SampleBenchmarkResult,
} from '../../utils/telemetryMath';

/**
 * DevPerformanceTelemetry.tsx
 *
 * Development-only performance instrumentation and lightweight on-screen telemetry.
 *
 * ============================================================================
 * ARCHITECTURAL METRIC DISTINCTIONS (Three.js / WebGL Mobile Profiling):
 * ============================================================================
 * 1. FPS / Frame Time (ms):
 *    - Measures wall-clock time between consecutive requestAnimationFrame ticks
 *      on the JavaScript main thread.
 *    - Includes JS execution (Zustand, React, physics, R3F useFrame callbacks),
 *      DOM style recalculations, Three.js matrix updates, WebGL command encoding,
 *      and CPU wait/sync for GPU buffer swaps (VSync).
 *    - High frame times can stem from CPU script execution OR CPU stalls waiting
 *      for previous GPU commands to complete.
 *
 * 2. Three.js Draw Calls & Triangles (`gl.info.render.calls`, `gl.info.render.triangles`):
 *    - Measures CPU-side WebGL submission overhead: the number of distinct draw
 *      calls (gl.drawElements / gl.drawArrays) dispatched per frame, and the
 *      total geometric polygon vertices processed.
 *    - Each draw call carries driver state-change overhead on mobile CPUs.
 *    - HOWEVER, draw calls and triangle counts do NOT measure true GPU execution
 *      time or fragment shading workload! 50 draw calls with heavy multi-light
 *      fragment shaders can bottleneck the GPU far worse than 200 unlit calls.
 *
 * 3. True GPU Execution Time & Mobile GPU Bottlenecks:
 *    - On mid-range and budget mobile chipsets (e.g. Qualcomm Snapdragon 665
 *      with Adreno 610 GPU in Xiaomi Redmi Note 8), GPU bottlenecks are primarily:
 *      a) Pixel fill-rate (screen resolution * DPR * overdraw).
 *      b) Fragment shader ALU complexity (multi-point light loops, procedural noise).
 *      c) Memory bandwidth & thermal throttling (sustained high load drops clock speed).
 *    - Standard WebGL 1/2 in mobile browsers does not reliably expose disjoint timer
 *      queries (`EXT_disjoint_timer_query_webgl2`) due to browser fingerprinting
 *      and timing attack protections. Therefore, GPU execution time must be inferred
 *      by observing frame times while selectively altering fill-rate (DPR/resolution)
 *      versus draw calls (mesh counts/instancing) versus fragment workload (lighting).
 * ============================================================================
 */

// Module-level telemetry shared state for zero React re-render overhead
const telemetryState = {
  active: false,
  instantFps: 0,
  instantFrameTimeMs: 0,
  avgFps: 0,
  avgFrameTimeMs: 0,
  p1LowFps: 0,
  maxFrameTimeMs: 0,
  drawCalls: 0,
  triangles: 0,
  points: 0,
  lines: 0,
  geometries: 0,
  textures: 0,
  programs: 0,
  resolution: '',
  dpr: 1,

  // Rolling frame time buffer (60 frames)
  frameHistory: [] as number[],
  maxHistorySize: 60,

  // Active benchmark sample session
  activeBenchmark: null as {
    endTime: number;
    frameTimes: number[];
    calls: number[];
    triangles: number[];
    resolve: (res: SampleBenchmarkResult) => void;
  } | null,
};

/**
 * R3F In-Canvas Tracker component.
 * Must be rendered as a child of <Canvas>.
 * Uses useFrame to read delta and gl.info without duplicate animation loops.
 */
export const DevPerformanceTracker: React.FC = () => {
  const { gl, viewport } = useThree();
  const lastBadgeUpdateRef = useRef<number>(0);

  // Initialize and register global window helpers (dev only)
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    telemetryState.active = true;

    if (typeof window !== 'undefined') {
      (window as any).__gl = gl;

      (window as any).__getPerformanceReport = (): PerformanceSnapshot => {
        const quality = useGameStore.getState().settings.graphicsQuality;
        const isTouch = useInputStore.getState().isTouchDevice;

        return {
          fps: Math.round(telemetryState.instantFps * 10) / 10,
          frameTimeMs: Math.round(telemetryState.instantFrameTimeMs * 100) / 100,
          avgFps: Math.round(telemetryState.avgFps * 10) / 10,
          avgFrameTimeMs: Math.round(telemetryState.avgFrameTimeMs * 100) / 100,
          p1LowFps: telemetryState.p1LowFps,
          maxFrameTimeMs: Math.round(telemetryState.maxFrameTimeMs * 100) / 100,
          drawCalls: telemetryState.drawCalls,
          triangles: telemetryState.triangles,
          points: telemetryState.points,
          lines: telemetryState.lines,
          geometries: telemetryState.geometries,
          textures: telemetryState.textures,
          programs: telemetryState.programs,
          resolution: telemetryState.resolution,
          dpr: telemetryState.dpr,
          quality,
          isTouchDevice: isTouch,
          architectureNotes: {
            fpsAndFrameTime:
              'Total wall-clock duration between animation frames on the main thread (JS + layout + WebGL submission + V-Sync wait).',
            drawCallsAndTriangles:
              'Three.js CPU-to-GPU submission call count and geometric polygon complexity; does NOT represent GPU fragment execution time.',
            gpuExecutionTime:
              'Mobile GPU fill-rate, fragment shading ALU, and thermal throttling. Standard WebGL does not expose GPU disjoint timer queries on mobile.',
          },
        };
      };

      (window as any).__samplePerformance = (
        durationMs = 5000
      ): Promise<SampleBenchmarkResult> => {
        return new Promise((resolve) => {
          const now = performance.now();
          telemetryState.activeBenchmark = {
            endTime: now + durationMs,
            frameTimes: [],
            calls: [],
            triangles: [],
            resolve: (summary: SampleBenchmarkResult) => {
              /* eslint-disable no-console */
              console.log(
                `%c[Diwali Mela Performance Benchmark — ${durationMs}ms]`,
                'color: #00ffcc; font-weight: bold;'
              );
              console.table({
                'Average FPS': summary.avgFps,
                'Min FPS': summary.minFps,
                '1% Low FPS': summary.p1LowFps,
                'Avg Frame Time (ms)': summary.avgFrameTimeMs,
                'Max Frame Spike (ms)': summary.maxFrameTimeMs,
                'Avg Draw Calls': summary.avgDrawCalls,
                'Max Draw Calls': summary.maxDrawCalls,
                'Avg Triangles': summary.avgTriangles,
                'Resolution': summary.resolution,
                'DPR': summary.dpr,
                'Quality': summary.quality,
              });
              /* eslint-enable no-console */
              resolve(summary);
            },
          };
        });
      };
    }

    return () => {
      telemetryState.active = false;
      if (typeof window !== 'undefined') {
        delete (window as any).__getPerformanceReport;
        delete (window as any).__samplePerformance;
        delete (window as any).__gl;
      }
    };
  }, [gl]);

  // Hook directly into R3F frame loop — ZERO duplicate animation loops
  useFrame((_, delta) => {
    if (!import.meta.env.DEV) return;

    const safeDelta = Math.max(delta, 0.0001);
    const frameTimeMs = safeDelta * 1000;
    const instantFps = 1 / safeDelta;

    telemetryState.instantFps = instantFps;
    telemetryState.instantFrameTimeMs = frameTimeMs;

    // Rolling history
    const history = telemetryState.frameHistory;
    history.push(frameTimeMs);
    if (history.length > telemetryState.maxHistorySize) {
      history.shift();
    }

    // Compute rolling stats
    let sumTime = 0;
    let maxTime = 0;
    for (let i = 0; i < history.length; i++) {
      const t = history[i];
      sumTime += t;
      if (t > maxTime) maxTime = t;
    }
    const avgTime = history.length > 0 ? sumTime / history.length : frameTimeMs;
    telemetryState.avgFrameTimeMs = avgTime;
    telemetryState.avgFps = avgTime > 0 ? 1000 / avgTime : 0;
    telemetryState.maxFrameTimeMs = maxTime;
    telemetryState.p1LowFps = calculate1PercentLowFps(history);

    // Read WebGL Renderer Statistics
    if (gl && gl.info) {
      telemetryState.drawCalls = gl.info.render?.calls ?? 0;
      telemetryState.triangles = gl.info.render?.triangles ?? 0;
      telemetryState.points = gl.info.render?.points ?? 0;
      telemetryState.lines = gl.info.render?.lines ?? 0;
      telemetryState.geometries = gl.info.memory?.geometries ?? 0;
      telemetryState.textures = gl.info.memory?.textures ?? 0;
      telemetryState.programs = gl.info.programs?.length ?? 0;
    }

    if (gl && gl.domElement) {
      telemetryState.resolution = `${gl.domElement.width}x${gl.domElement.height}`;
    }
    telemetryState.dpr = viewport.dpr;

    // Benchmark sample collector
    const bench = telemetryState.activeBenchmark;
    if (bench) {
      bench.frameTimes.push(frameTimeMs);
      bench.calls.push(telemetryState.drawCalls);
      bench.triangles.push(telemetryState.triangles);

      if (performance.now() >= bench.endTime) {
        const total = bench.frameTimes.length;
        let sumFt = 0;
        let maxFt = 0;
        let minFpsCalc = 999;
        let maxFpsCalc = 0;

        for (let i = 0; i < total; i++) {
          const ft = bench.frameTimes[i];
          sumFt += ft;
          if (ft > maxFt) maxFt = ft;
          const fps = ft > 0 ? 1000 / ft : 0;
          if (fps < minFpsCalc) minFpsCalc = fps;
          if (fps > maxFpsCalc) maxFpsCalc = fps;
        }

        const avgFt = total > 0 ? sumFt / total : 0;
        const avgFps = avgFt > 0 ? 1000 / avgFt : 0;

        let sumCalls = 0;
        let maxCalls = 0;
        for (let i = 0; i < bench.calls.length; i++) {
          const c = bench.calls[i];
          sumCalls += c;
          if (c > maxCalls) maxCalls = c;
        }

        let sumTris = 0;
        let maxTris = 0;
        for (let i = 0; i < bench.triangles.length; i++) {
          const t = bench.triangles[i];
          sumTris += t;
          if (t > maxTris) maxTris = t;
        }

        const quality = useGameStore.getState().settings.graphicsQuality;
        const isTouch = useInputStore.getState().isTouchDevice;

        const summary: SampleBenchmarkResult = {
          durationMs: Math.round(sumFt),
          totalFrames: total,
          avgFps: Math.round(avgFps * 10) / 10,
          minFps: Math.round(minFpsCalc * 10) / 10,
          maxFps: Math.round(maxFpsCalc * 10) / 10,
          p1LowFps: calculate1PercentLowFps(bench.frameTimes),
          avgFrameTimeMs: Math.round(avgFt * 100) / 100,
          maxFrameTimeMs: Math.round(maxFt * 100) / 100,
          avgDrawCalls: Math.round(total > 0 ? sumCalls / total : 0),
          maxDrawCalls: maxCalls,
          avgTriangles: Math.round(total > 0 ? sumTris / total : 0),
          maxTriangles: maxTris,
          resolution: telemetryState.resolution,
          dpr: telemetryState.dpr,
          quality,
          isTouchDevice: isTouch,
        };

        bench.resolve(summary);
        telemetryState.activeBenchmark = null;
      }
    }

    // Direct DOM text mutation throttled to 350ms (zero React re-renders)
    const now = performance.now();
    if (now - lastBadgeUpdateRef.current >= 350) {
      lastBadgeUpdateRef.current = now;
      const compactEl = document.getElementById('dev-perf-compact-text');
      if (compactEl) {
        const fps = Math.round(telemetryState.avgFps);
        const ms = telemetryState.avgFrameTimeMs.toFixed(1);
        const calls = telemetryState.drawCalls;
        const trisK = (telemetryState.triangles / 1000).toFixed(1);
        compactEl.textContent = `${fps} FPS | ${ms}ms | ${calls} calls | ${trisK}k tris`;
      }

      const detailedEl = document.getElementById('dev-perf-detailed-text');
      if (detailedEl) {
        detailedEl.innerHTML = `
          <div class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]">
            <div><span class="text-zinc-400">FPS (Avg / 1%):</span> <b class="text-emerald-400">${Math.round(telemetryState.avgFps)}</b> / <b class="text-amber-400">${telemetryState.p1LowFps}</b></div>
            <div><span class="text-zinc-400">Frame:</span> <b class="text-white">${telemetryState.avgFrameTimeMs.toFixed(1)}ms</b> (max ${telemetryState.maxFrameTimeMs.toFixed(0)})</div>
            <div><span class="text-zinc-400">Draw Calls:</span> <b class="text-cyan-300">${telemetryState.drawCalls}</b></div>
            <div><span class="text-zinc-400">Triangles:</span> <b class="text-cyan-300">${(telemetryState.triangles / 1000).toFixed(1)}k</b></div>
            <div><span class="text-zinc-400">Memory:</span> ${telemetryState.geometries} geo, ${telemetryState.textures} tex</div>
            <div><span class="text-zinc-400">DPR/Res:</span> ${telemetryState.dpr}x (${telemetryState.resolution})</div>
          </div>
        `;
      }
    }
  });

  if (!import.meta.env.DEV) {
    return null;
  }

  return null;
};

/**
 * DevPerformanceOverlay:
 * Lightweight HTML HUD badge rendered outside <Canvas>.
 * Only rendered in development (import.meta.env.DEV).
 */
export const DevPerformanceOverlay: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [samplingStatus, setSamplingStatus] = useState<string | null>(null);

  const isRiding = useGameStore((s) => s.ferrisWheelRide.isRiding);
  const activeGreeting = useNpcStore((s) => s.activeGreeting);
  const activeModal = useGameStore((s) => s.activeModal);

  const handleSampleClick = useCallback(async () => {
    if (typeof window === 'undefined' || !(window as any).__samplePerformance) return;
    setSamplingStatus('Sampling 5s...');
    try {
      const result: SampleBenchmarkResult = await (window as any).__samplePerformance(5000);
      setSamplingStatus(`Avg: ${result.avgFps} FPS | Low: ${result.p1LowFps} | ${result.avgDrawCalls} calls`);
      setTimeout(() => setSamplingStatus(null), 8000);
    } catch {
      setSamplingStatus('Sample failed');
      setTimeout(() => setSamplingStatus(null), 3000);
    }
  }, []);

  if (!import.meta.env.DEV) {
    return null;
  }

  // Hide telemetry overlay during full-screen modals, vendor greetings, or ride overlays to prevent pointer-event obstruction
  if (isRiding || activeGreeting || activeModal !== 'none') {
    return null;
  }

  return (
    <div
      className="fixed top-16 right-3 md:right-6 z-50 pointer-events-none flex flex-col items-end select-none font-mono"
      style={{ touchAction: 'manipulation' }}
    >
      <div className="bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 rounded-lg shadow-xl text-cyan-300 p-1.5 flex flex-col gap-1 max-w-[280px] pointer-events-auto">
        {/* Header / Compact Bar */}
        <div className="flex items-center justify-between gap-2 text-[11px] cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
          <span id="dev-perf-compact-text" className="font-semibold text-emerald-300">
            Telemetry init...
          </span>
          <button
            type="button"
            className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-700/60 text-cyan-200 hover:bg-cyan-900"
          >
            {expanded ? 'Hide' : 'More'}
          </button>
        </div>

        {/* Expanded Telemetry Details */}
        {expanded && (
          <div className="mt-1 pt-1.5 border-t border-cyan-800/40 flex flex-col gap-1.5">
            <div id="dev-perf-detailed-text">
              <span className="text-[10px] text-zinc-400">Loading render stats...</span>
            </div>

            {/* Benchmark Sample Button */}
            <div className="flex items-center justify-between gap-1 pt-1 border-t border-cyan-900/40">
              <button
                type="button"
                onClick={handleSampleClick}
                disabled={Boolean(samplingStatus)}
                className="text-[10px] bg-gradient-to-r from-cyan-900 to-blue-900 hover:from-cyan-800 hover:to-blue-800 text-cyan-100 px-2 py-1 rounded border border-cyan-500/40 font-bold active:scale-95 transition-transform"
              >
                {samplingStatus ? 'Profiling...' : 'Sample 5s Benchmark'}
              </button>
              <span className="text-[9px] text-zinc-400">Chrome DevTools: __getPerformanceReport()</span>
            </div>

            {samplingStatus && (
              <div className="text-[10px] text-amber-300 bg-amber-950/50 p-1 rounded border border-amber-600/40">
                {samplingStatus}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
