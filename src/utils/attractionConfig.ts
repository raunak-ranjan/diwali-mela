/**
 * Configuration constants for Diwali Mela attractions (Ferris Wheel, Sangeet Stage Video, etc.)
 */

export const FERRIS_WHEEL_CONFIG = {
  // Speed in radians per second
  NORMAL_SPEED: 0.45, // ~14s per full 360° revolution (noticeable, lively carnival pace)
  REDUCED_MOTION_SPEED: 0.08, // ~78s per revolution (gentle, accessible pace)
} as const;

export const SANGEET_VIDEO_CONFIG = {
  VIDEO_ID: 'ETsmAnCfY68',
  EMBED_URL: 'https://www.youtube-nocookie.com/embed/ETsmAnCfY68?autoplay=0&rel=0&modestbranding=1&playsinline=1',
  WATCH_URL: 'https://www.youtube.com/watch?v=ETsmAnCfY68',
  TITLE: 'Cultural Sangeet Performance',
  SUBTITLE: 'Traditional Diwali Dance & Musical Celebration',
} as const;
