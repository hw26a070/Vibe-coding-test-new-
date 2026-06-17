/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Direction = 'N' | 'S' | 'E' | 'W';

export interface Tile {
  id: string;
  type: 'road' | 'empty';
  connections: Direction[];
  specialty: 'none' | 'forge' | 'shop' | 'chest' | 'dojo' | 'enemy' | 'fountain' | 'poison';
  specialtyVisited: boolean;
  specialtyValue: number; // Value of buff or enemy strength/debuff
  specialtyName?: string;  // Name of weapon, item, or enemy/trap
  originalIndex: number;  // For design pattern variation
  isStatic?: boolean;     // Preset static tiles (enemies and weapons preplaced)
  patternId?: string;     // To return to inventory on removal
}

export interface PlayerHero {
  power: number;
  maxPower: number;
  level: number;
  weapon: string;
  shield: string;
  accessory: string;
  status: 'idle' | 'walking' | 'blocked' | 'battling' | 'victory' | 'defeated';
  // Position inside the game
  // Can be 'start', 'goal', or on a tile (row, col)
  position: 'start' | 'goal' | { row: number; col: number };
  // Sub-position within the current tile:
  // 'entering' (just walked onto tile), 'center' (at the building/junction), 'exiting' (exiting the tile)
  subPosition: 'entering' | 'center' | 'exiting';
  entryDirection: Direction | null; // Direction from which the hero entered this tile
  exitDirection: Direction | null;  // Current planned exit direction
  pathHistory: { row: number; col: number }[]; // To prevent infinite loops or show path trace
}

export interface Stage {
  id: number;
  name: string;
  description: string;
  gridSize: number; // 3 for 3x3, 4 for 4x4, etc.
  startCastleRow: number; // Start connection from West at this row
  initialHeroPower: number;
  // Grid layout spec (preset items and monsters preplaced)
  allowedSpecialties: {
    type: Tile['specialty'];
    name: string;
    value: number;
    count: number;
  }[];
  panelInventory?: Record<string, number>; // Maps path pattern IDs to allowed placement limits
}

export interface GameSettings {
  isMuted: boolean;
  gameSpeed: number; // 1x, 1.5x, 2x
}
