/**
 * Configuration constants for Diwali Mela attractions (Ferris Wheel, Sangeet Stage Screen, etc.)
 */

export const FERRIS_WHEEL_CONFIG = {
  // Speed in radians per second (~11.4s per full 360° revolution: lively, realistic mela Ferris wheel pace)
  NORMAL_SPEED: 0.55,
  // Gentle pace for accessibility (~78.5s per revolution)
  REDUCED_MOTION_SPEED: 0.08,
} as const;

export const SANGEET_VIDEO_CONFIG = {
  VIDEO_ID: 'ETsmAnCfY68',
  EMBED_URL: 'https://www.youtube-nocookie.com/embed/ETsmAnCfY68?autoplay=0&playsinline=1&rel=0',
  WATCH_URL: 'https://www.youtube.com/watch?v=ETsmAnCfY68',
  TITLE: 'Cultural Sangeet Performance',
  SUBTITLE: 'Traditional Diwali Dance & Musical Celebration',
  STAGE_SCREEN: {
    WIDTH: 9.6, // 3D world meters
    HEIGHT: 5.4, // 3D world meters (exact 16:9 aspect ratio)
    PIXEL_WIDTH: 960, // CSS pixels
    PIXEL_HEIGHT: 540, // CSS pixels (100px/meter at distanceFactor=4)
    DISTANCE_FACTOR: 4.0,
  },
} as const;
