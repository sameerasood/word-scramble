// Common 5-8 letter words that are fun to unscramble
export const WORDS = [
  'PLANET', 'ROCKET', 'JUNGLE', 'COFFEE', 'GARDEN',
  'BASKET', 'CASTLE', 'DRAGON', 'FROZEN', 'GINGER',
  'HAMMER', 'ISLAND', 'JACKET', 'KITTEN', 'LEMON',
  'MONKEY', 'NATURE', 'ORANGE', 'PENCIL', 'RABBIT',
  'SALMON', 'TURTLE', 'UMBRELLA', 'VIOLET', 'WINDOW',
  'YELLOW', 'ZIGZAG', 'BRIDGE', 'CANDLE', 'DESERT',
  'EMPIRE', 'FLOWER', 'GUITAR', 'HOCKEY', 'INSECT',
  'JIGSAW', 'KNIGHT', 'LAPTOP', 'MIRROR', 'NEEDLE',
  'OYSTER', 'PARROT', 'QUARTZ', 'RHYTHM', 'SPIDER',
  'TOMATO', 'UNIQUE', 'VELVET', 'WINTER', 'YOGURT',
  'BRONZE', 'CIRCUS', 'DOLPHIN', 'ECLIPSE', 'FABRIC',
  'GRAVITY', 'HARVEST', 'ICEBERG', 'JOURNEY', 'KITCHEN',
  'LANTERN', 'MYSTERY', 'NETWORK', 'OCTOPUS', 'PHANTOM',
  'QUARTER', 'RAINBOW', 'SHELTER', 'THUNDER', 'VAMPIRE',
  'WHISPER', 'CRYSTAL', 'BISCUIT', 'CUSHION', 'DIAMOND',
  'ELEMENT', 'FORTUNE', 'GIRAFFE', 'HARMONY', 'IMAGINE',
  'JASMINE', 'KINGDOM', 'LIBRARY', 'MACHINE', 'NAPKIN',
  'ORCHARD', 'PENGUIN', 'QUALITY', 'RETREAT', 'SUMMIT',
  'TORNADO', 'UNICORN', 'VILLAGE', 'WARRIOR', 'ZEPHYR',
];

export function getRandomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

export function getRandomWords(count: number): string[] {
  const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
