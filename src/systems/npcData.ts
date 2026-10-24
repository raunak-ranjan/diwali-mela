import type { AmbientVisitorConfig, VendorNpcConfig, MelaQueueConfig } from '../types/npc';
import type { BoundingBox2D } from './npcLogic';

export const RESTRICTED_MELA_ZONES: BoundingBox2D[] = [
  { id: 'player_spawn', minX: -4, maxX: 4, minZ: -28, maxZ: -16 },
  { id: 'stall_mithai', minX: -17, maxX: -11, minZ: 3, maxZ: 9 },
  { id: 'stall_chaat', minX: -17, maxX: -11, minZ: 12, maxZ: 18 },
  { id: 'stall_handicrafts', minX: -17, maxX: -11, minZ: -12, maxZ: -6 },
  { id: 'booth_ring_toss', minX: 11.5, maxX: 16.5, minZ: -12, maxZ: -6 },
  { id: 'booth_balloon', minX: 11.5, maxX: 16.5, minZ: 3, maxZ: 9 },
  { id: 'ferris_wheel', minX: 16, maxX: 28, minZ: 14, maxZ: 26 },
  { id: 'cultural_stage', minX: -9, maxX: 9, minZ: 32, maxZ: 42 },
  { id: 'central_urli', minX: -2.2, maxX: 2.2, minZ: -2.2, maxZ: 2.2 },
];

export const MELA_QUEUES: MelaQueueConfig[] = [
  {
    id: 'queue_mithai',
    name: 'Mithai Sweets Stall Queue',
    servicePoint: [-10.2, 0, 6.0],
    slots: [
      [-10.2, 0, 6.0],
      [-8.6, 0, 6.0],
      [-7.0, 0, 6.0],
    ],
    facingYaw: -Math.PI / 2, // Facing West toward the sweet stall counter
    serviceDuration: 4.5,
  },
  {
    id: 'queue_chaat',
    name: 'Old Delhi Chaat Stall Queue',
    servicePoint: [-10.2, 0, 15.0],
    slots: [
      [-10.2, 0, 15.0],
      [-8.6, 0, 15.0],
      [-7.0, 0, 15.0],
    ],
    facingYaw: -Math.PI / 2, // Facing West toward chaat counter
    serviceDuration: 4.0,
  },
  {
    id: 'queue_ferris_wheel',
    name: 'Giant Ferris Wheel Ride Queue',
    servicePoint: [15.0, 0, 20.0],
    slots: [
      [15.0, 0, 20.0],
      [13.5, 0, 20.0],
      [12.0, 0, 20.0],
    ],
    facingYaw: Math.PI / 2, // Facing East toward the Ferris wheel boarding steps
    serviceDuration: 5.5,
  },
  {
    id: 'queue_balloon',
    name: 'Balloon Shooting Booth Queue',
    servicePoint: [10.5, 0, 6.0],
    slots: [
      [10.5, 0, 6.0],
      [9.0, 0, 6.0],
    ],
    facingYaw: Math.PI / 2, // Facing East toward the target gallery
    serviceDuration: 4.0,
  },
];

export const AMBIENT_VISITORS: AmbientVisitorConfig[] = [
  {
    id: 'visitor_aarav',
    name: 'Aarav',
    role: 'stroller',
    tier: 'essential',
    speed: 1.2,
    pauseDuration: 3.0,
    waypoints: [
      [-5.0, 0, -4.0],
      [0.0, 0, -5.5],
      [5.0, 0, -4.0],
      [0.0, 0, -3.2],
    ],
    outfit: {
      skinColor: '#d49b6a',
      kurtaColor: '#1e3a8a',
      pagriColor: '#f59e0b',
      pagriAccentColor: '#dc2626',
      pyjamaColor: '#fef3c7',
      juttiColor: '#78350f',
    },
  },
  {
    id: 'visitor_priya',
    name: 'Priya',
    role: 'devotee',
    tier: 'essential',
    speed: 1.1,
    pauseDuration: 4.0,
    waypoints: [
      [5.5, 0, 1.0],
      [6.5, 0, 5.0],
      [5.0, 0, 8.5],
      [5.5, 0, 3.5],
    ],
    outfit: {
      skinColor: '#e0a96d',
      kurtaColor: '#b91c1c',
      stoleColor: '#fbbf24',
      pyjamaColor: '#fffbeb',
      juttiColor: '#991b1b',
    },
    accessory: 'diya',
  },
  {
    id: 'visitor_rohan',
    name: 'Rohan',
    role: 'spectator',
    tier: 'standard',
    speed: 1.0,
    pauseDuration: 4.5,
    waypoints: [
      [-4.5, 0, 24.0],
      [0.0, 0, 25.0],
      [4.5, 0, 24.0],
      [0.0, 0, 23.0],
    ],
    outfit: {
      skinColor: '#c68b59',
      kurtaColor: '#047857',
      stoleColor: '#ea580c',
      pyjamaColor: '#ffffff',
      juttiColor: '#92400e',
    },
    targetQueueId: 'queue_chaat',
    watchFocusPoint: [0, 2, 36],
  },
  {
    id: 'visitor_ananya',
    name: 'Ananya',
    role: 'shopper',
    tier: 'standard',
    speed: 1.3,
    pauseDuration: 3.5,
    waypoints: [
      [7.0, 0, -3.0],
      [8.0, 0, 0.0],
      [7.0, 0, 2.0],
      [6.5, 0, -1.0],
    ],
    outfit: {
      skinColor: '#df9f68',
      kurtaColor: '#be185d',
      stoleColor: '#f59e0b',
      pyjamaColor: '#fef3c7',
      juttiColor: '#d97706',
    },
    accessory: 'sparkler',
    targetQueueId: 'queue_mithai',
  },
  {
    id: 'visitor_kabir',
    name: 'Kabir',
    role: 'stroller',
    tier: 'standard',
    speed: 1.1,
    pauseDuration: 4.0,
    waypoints: [
      [-7.0, 0, -3.0],
      [-8.0, 0, 0.0],
      [-6.5, 0, 2.0],
      [-6.0, 0, -1.0],
    ],
    outfit: {
      skinColor: '#c5834b',
      kurtaColor: '#c2410c',
      pagriColor: '#eab308',
      pagriAccentColor: '#15803d',
      pyjamaColor: '#f8fafc',
      juttiColor: '#451a03',
    },
    targetQueueId: 'queue_ferris_wheel',
  },
  {
    id: 'visitor_meera',
    name: 'Meera',
    role: 'spectator',
    tier: 'standard',
    speed: 1.05,
    pauseDuration: 5.0,
    waypoints: [
      [0.0, 0, 20.0],
      [3.0, 0, 22.0],
      [-3.0, 0, 22.0],
    ],
    outfit: {
      skinColor: '#e0a96d',
      kurtaColor: '#7c3aed',
      stoleColor: '#fde047',
      pyjamaColor: '#fef3c7',
      juttiColor: '#6d28d9',
    },
    watchFocusPoint: [0, 2, 36],
  },
  {
    id: 'visitor_vikram',
    name: 'Vikram',
    role: 'shopper',
    tier: 'standard',
    speed: 1.15,
    pauseDuration: 3.8,
    waypoints: [
      [-6.0, 0, 6.0],
      [-6.0, 0, 12.0],
      [-6.0, 0, 15.0],
      [-5.0, 0, 9.0],
    ],
    outfit: {
      skinColor: '#c5834b',
      kurtaColor: '#0284c7',
      pagriColor: '#ea580c',
      pagriAccentColor: '#fbbf24',
      pyjamaColor: '#ffffff',
      juttiColor: '#0369a1',
    },
    targetQueueId: 'queue_chaat',
  },
];

export const VENDOR_NPCS: VendorNpcConfig[] = [
  {
    id: 'vendor_mithai',
    name: 'Ganesh Kaka',
    shopName: 'Shree Ganesh Sweets & Mithai',
    position: [-14.5, 0, 6],
    rotationY: Math.PI / 2, // Facing East toward stall counter
    outfit: {
      skinColor: '#d49b6a',
      kurtaColor: '#b45309',
      pagriColor: '#f59e0b',
      pagriAccentColor: '#dc2626',
      pyjamaColor: '#fffbeb',
      juttiColor: '#78350f',
    },
    greetingText: 'Namaste! Welcome to our Diwali sweet shop — fresh hot gulab jamun and jalebi!',
    accentDialogue: 'May your festival be filled with joy and boundless sweetness!',
  },
  {
    id: 'vendor_chaat',
    name: 'Master Ramu',
    shopName: 'Old Delhi Chaat & Snacks',
    position: [-14.5, 0, 15],
    rotationY: Math.PI / 2, // Facing East toward stall counter
    outfit: {
      skinColor: '#c68b59',
      kurtaColor: '#991b1b',
      pagriColor: '#ea580c',
      pagriAccentColor: '#fbbf24',
      pyjamaColor: '#fef3c7',
      juttiColor: '#92400e',
    },
    greetingText: 'Aaiye, aaiye! Spicy festive chaat and golden crispy samosas hot from the kadhai!',
    accentDialogue: 'Treat yourself to the authentic flavours of the Diwali Mela!',
  },
  {
    id: 'vendor_handicrafts',
    name: 'Artisan Suresh',
    shopName: 'Diwali Diyas & Festive Handicrafts',
    position: [-14.5, 0, -9],
    rotationY: Math.PI / 2, // Facing East toward stall counter
    outfit: {
      skinColor: '#e0a96d',
      kurtaColor: '#065f46',
      pagriColor: '#ca8a04',
      pagriAccentColor: '#b91c1c',
      pyjamaColor: '#ffffff',
      juttiColor: '#451a03',
    },
    greetingText: 'Shubh Deepavali! Handcrafted clay diyas and shining sky lanterns to brighten your home!',
    accentDialogue: 'Every diya is sculpted by hand with festival blessings!',
  },
];
