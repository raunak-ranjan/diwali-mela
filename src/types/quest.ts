export interface MagicalDiyaConfig {
  id: string;
  name: string;
  hindiName: string;
  position: [number, number, number];
  zoneHint: string;
}

export const MAGICAL_DIYAS_CONFIG: MagicalDiyaConfig[] = [
  {
    id: 'magical_diya_entrance',
    name: 'Diya of Auspicious Beginnings',
    hindiName: 'शुभ आरंभ दीप',
    position: [2.2, 0.45, -20.5],
    zoneHint: 'Near the Grand Entrance Arch',
  },
  {
    id: 'magical_diya_plaza',
    name: 'Diya of Harmony & Art',
    hindiName: 'कला दीप',
    position: [-2.8, 0.45, 2.5],
    zoneHint: 'At Central Rangoli Plaza',
  },
  {
    id: 'magical_diya_sweets',
    name: 'Diya of Sweet Abundance',
    hindiName: 'मिष्ठान्न दीप',
    position: [-10.0, 0.5, 5.5],
    zoneHint: 'At the Food & Sweets Bazaar',
  },
  {
    id: 'magical_diya_wheel',
    name: 'Diya of Cosmic Wonder',
    hindiName: 'चक्र दीप',
    position: [16.2, 0.45, 19.5],
    zoneHint: 'By the Giant Ferris Wheel',
  },
  {
    id: 'magical_diya_stage',
    name: 'Diya of Rhythm & Celebration',
    hindiName: 'उत्सव दीप',
    position: [4.5, 0.45, 29.5],
    zoneHint: 'Beside the Cultural Performance Stage',
  },
];
