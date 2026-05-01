/**
 * CharacterData.js
 * Central configuration for all playable characters.
 * Add new characters here - system is fully dynamic.
 */

export const CHARACTERS = [
  { 
    key: 'char1', 
    name: 'Sanju',
    bodyColor: 0xee4444,
    darkColor: 0xaa2222,
    lightColor: 0xff8888,
  },
  { 
    key: 'char2', 
    name: 'Sabbu',
    bodyColor: 0x4488ee,
    darkColor: 0x2255aa,
    lightColor: 0x88bbff,
  },
  { 
    key: 'char3', 
    name: 'Kurkure',
    bodyColor: 0x44cc66,
    darkColor: 0x228844,
    lightColor: 0x88ff99,
  },
  { 
    key: 'char4', 
    name: 'Mapla',
    bodyColor: 0xeecc22,
    darkColor: 0xaa8800,
    lightColor: 0xffee88,
  },
  { 
    key: 'char5', 
    name: 'Mama',
    bodyColor: 0x9944ee,
    darkColor: 0x6622aa,
    lightColor: 0xcc88ff,
  },
  { 
    key: 'char6', 
    name: 'Kk',
    bodyColor: 0xee8844,
    darkColor: 0xaa5522,
    lightColor: 0xffaa66,
  },
  { 
    key: 'char7', 
    name: 'Muong',
    bodyColor: 0x44eeee,
    darkColor: 0x22aaaa,
    lightColor: 0x88ffff,
  },
  { 
    key: 'char8', 
    name: 'Chozha',
    bodyColor: 0xee44aa,
    darkColor: 0xaa2266,
    lightColor: 0xff88cc,
  },
  { 
    key: 'char9', 
    name: 'Ash',
    bodyColor: 0xaa6644,
    darkColor: 0x884422,
    lightColor: 0xcc8866,
  },
  { 
    key: 'char10', 
    name: 'Kallakurichi',
    bodyColor: 0x88ee44,
    darkColor: 0x55aa22,
    lightColor: 0xaaffaa,
  },
];

// Face placeholder dimensions (consistent across all characters)
export const FACE_CONFIG = {
  width: 20,
  height: 20,
  offsetX: 14,  // from left of 48px frame
  offsetY: 8,   // from top of 60px frame
};

// Frame dimensions
export const SPRITE_CONFIG = {
  frameWidth: 48,
  frameHeight: 60,
  frameCount: 8,
};
