export interface FestivalCollectibleConfig {
  id: string;
  name: string;
  hindiName: string;
  description: string;
  lore: string;
  icon: string;
  position: [number, number, number];
  zone: string;
  zoneHint: string;
  rewardTokens: number;
}

export const FESTIVAL_COLLECTIBLES_CONFIG: readonly FestivalCollectibleConfig[] = [
  {
    id: 'collectible_garland',
    name: 'Auspicious Marigold Garland',
    hindiName: 'मंगल गेंदा माला',
    description: 'A fragrant golden toran woven from fresh orange marigolds and green mango leaves.',
    lore: 'Woven by flower vendors at dawn to welcome guests and ward off negative energies.',
    icon: '🌼',
    position: [2.5, 0.45, -21.5],
    zone: 'entrance',
    zoneHint: 'Near the North Entrance Gateway walkway',
    rewardTokens: 15,
  },
  {
    id: 'collectible_brass_bell',
    name: 'Sacred Temple Ghanta',
    hindiName: 'पवित्र पीतल घंटा',
    description: 'An ancient hand-carved brass bell with resonant acoustic harmonics.',
    lore: 'Its ringing sound dispels negative thoughts and invokes auspicious divine presence.',
    icon: '🔔',
    position: [-6.2, 0.45, -2.5],
    zone: 'central_plaza',
    zoneHint: 'West edge of Central Plaza near the sacred shrine flowers',
    rewardTokens: 15,
  },
  {
    id: 'collectible_silver_coin',
    name: 'Lakshmi-Ganesh Silver Coin',
    hindiName: 'शुभ चांदी सिक्का',
    description: 'A polished keepsake coin embossed with Goddess Lakshmi and Lord Ganesha.',
    lore: 'Exchanged during Diwali puja as a symbol of permanent prosperity, wisdom, and luck.',
    icon: '🪙',
    position: [-10.5, 0.45, -4.5],
    zone: 'shopping_street',
    zoneHint: 'Tucked along the artisanal Handicrafts & Diya walkway',
    rewardTokens: 15,
  },
  {
    id: 'collectible_peacock_fan',
    name: 'Mor Pankh Pankha',
    hindiName: 'मयूर पंख पंखा',
    description: 'An exquisite hand fan fashioned from iridescent emerald and sapphire peacock plumes.',
    lore: 'Waved gently by classical dancers before taking the stage for the festive sangeet.',
    icon: '🪶',
    position: [6.8, 0.45, 28.5],
    zone: 'cultural_stage',
    zoneHint: 'Resting on the greenroom riser beside the Cultural Stage',
    rewardTokens: 15,
  },
] as const;

export const KNOWN_COLLECTIBLE_IDS = FESTIVAL_COLLECTIBLES_CONFIG.map((c) => c.id);
