/**
 * Pure telemetry calculation helpers and types.
 */

export interface PerformanceSnapshot {
  fps: number;
  frameTimeMs: number;
  avgFps: number;
  avgFrameTimeMs: number;
  p1LowFps: number;
  maxFrameTimeMs: number;
  drawCalls: number;
  triangles: number;
  points: number;
  lines: number;
  geometries: number;
  textures: number;
  programs: number;
  resolution: string;
  dpr: number;
  quality: string;
  isTouchDevice: boolean;
  architectureNotes: {
    fpsAndFrameTime: string;
    drawCallsAndTriangles: string;
    gpuExecutionTime: string;
  };
}

export interface SampleBenchmarkResult {
  durationMs: number;
  totalFrames: number;
  avgFps: number;
  minFps: number;
  maxFps: number;
  p1LowFps: number;
  avgFrameTimeMs: number;
  maxFrameTimeMs: number;
  avgDrawCalls: number;
  maxDrawCalls: number;
  avgTriangles: number;
  maxTriangles: number;
  resolution: string;
  dpr: number;
  quality: string;
  isTouchDevice: boolean;
}

/**
 * Calculates the 1% low FPS from an array of frame times (ms).
 * Sorts frame times ascending and takes the 99th percentile slowest frame time.
 */
export function calculate1PercentLowFps(frameTimesMs: number[]): number {
  if (frameTimesMs.length === 0) return 0;
  const sorted = [...frameTimesMs].sort((a, b) => a - b);
  const p99Index = Math.min(
    sorted.length - 1,
    Math.floor(sorted.length * 0.99)
  );
  const slowestFrameMs = sorted[p99Index];
  return slowestFrameMs > 0 ? Math.round((1000 / slowestFrameMs) * 10) / 10 : 0;
}
