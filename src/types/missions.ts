export interface FestivalMissionStep {
  id: string;
  label: string;
  hint: string;
  zone: string;
  targetCount: number;
}

export interface FestivalMissionConfig {
  id: string;
  title: string;
  hindiTitle: string;
  description: string;
  steps: FestivalMissionStep[];
  rewardTokens: number;
}

export interface MissionProgress {
  currentStepIndex: number;
  stepCounts: Record<string, number>;
  isCompleted: boolean;
  isClaimed: boolean;
}

export interface MissionJournalSaveState {
  activeMissionId: string;
  progress: Record<string, MissionProgress>;
}

export const FESTIVAL_MISSIONS_CONFIG: readonly FestivalMissionConfig[] = [
  {
    id: 'mission_welcome',
    title: 'The Auspicious Arrival',
    hindiTitle: 'शुभ आगमन',
    description: 'Begin your festive pilgrimage through the illuminated gates into the heart of the fairground.',
    rewardTokens: 25,
    steps: [
      {
        id: 'visit_entrance',
        label: 'Pass through the Grand Entrance Arch',
        hint: 'Walk beneath the glowing entrance toran on the North pathway.',
        zone: 'entrance',
        targetCount: 1,
      },
      {
        id: 'visit_plaza',
        label: 'Visit the Central Rangoli Plaza',
        hint: 'Head towards the centerpiece geometric floral rangoli at [0, 0].',
        zone: 'central_plaza',
        targetCount: 1,
      },
      {
        id: 'kindle_first_diya',
        label: 'Kindle your first Sacred Golden Diya',
        hint: 'Find and ignite any one of the five Sacred Lights.',
        zone: 'mela',
        targetCount: 1,
      },
    ],
  },
  {
    id: 'mission_culture_bazaar',
    title: 'Bazaar Flavors & Sangeet',
    hindiTitle: 'मेला संस्कृति व संगीत',
    description: 'Experience the aromatic sweet stalls and soulful evening ragas of the Cultural Stage.',
    rewardTokens: 35,
    steps: [
      {
        id: 'visit_bazaar',
        label: 'Explore the Food & Sweets Bazaar',
        hint: 'Wander down the West bazaar lane where mithai and savory stalls thrive.',
        zone: 'food_street',
        targetCount: 1,
      },
      {
        id: 'visit_stage',
        label: 'Attend the Cultural Sangeet Stage',
        hint: 'Approach the South performance stage and listen to classical festive music.',
        zone: 'cultural_stage',
        targetCount: 1,
      },
      {
        id: 'visit_ferris_wheel',
        label: 'View the Giant Illuminated Ferris Wheel',
        hint: 'Walk towards the colossal spinning wheel in the East quarter.',
        zone: 'ferris_wheel',
        targetCount: 1,
      },
    ],
  },
  {
    id: 'mission_carnival_master',
    title: 'Carnival Sharpshooter',
    hindiTitle: 'मेला खेल विजेता',
    description: 'Test your aim and coordination at the vibrant carnival game booths.',
    rewardTokens: 45,
    steps: [
      {
        id: 'play_balloon_game',
        label: 'Pop balloons in the Balloon Shooting Gallery',
        hint: 'Achieve at least 20 points in a round of balloon shooting.',
        zone: 'carnival',
        targetCount: 1,
      },
      {
        id: 'play_ring_toss',
        label: 'Toss rings onto the ceremonial brass lotas',
        hint: 'Land at least 1 successful ring toss at the booth.',
        zone: 'carnival',
        targetCount: 1,
      },
      {
        id: 'kindle_three_diyas',
        label: 'Kindle at least 3 Sacred Golden Diyas',
        hint: 'Explore the fairgrounds to locate and kindle 3 sacred lights.',
        zone: 'mela',
        targetCount: 3,
      },
    ],
  },
  {
    id: 'mission_illuminator_finale',
    title: 'Grand Diwali Illuminator',
    hindiTitle: 'दीपावली महोत्सव पूर्णाहुति',
    description: 'Illuminate the entire fairground and celebrate the triumph of light with a celestial fireworks show.',
    rewardTokens: 60,
    steps: [
      {
        id: 'kindle_all_diyas',
        label: 'Kindle all 5 Sacred Golden Diyas',
        hint: 'Complete the sacred five-light pilgrimage across all mela zones.',
        zone: 'mela',
        targetCount: 5,
      },
      {
        id: 'discover_keepsakes',
        label: 'Discover at least 2 Hidden Festival Keepsakes',
        hint: 'Search around quiet nooks, shrines, and walkways for hidden treasures.',
        zone: 'mela',
        targetCount: 2,
      },
      {
        id: 'watch_fireworks',
        label: 'Witness the Celestial Fireworks Spectacular',
        hint: 'Watch or launch fireworks from the Fireworks Pavilion.',
        zone: 'celebration_area',
        targetCount: 1,
      },
    ],
  },
] as const;

export const KNOWN_MISSION_IDS = FESTIVAL_MISSIONS_CONFIG.map((m) => m.id);
