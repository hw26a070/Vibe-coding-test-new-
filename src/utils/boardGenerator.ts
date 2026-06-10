/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Tile, Direction, Stage } from '../types';

// Helper to get matching entry direction for adjacent tile
export const getOppositeDirection = (dir: Direction): Direction => {
  const opposites: Record<Direction, Direction> = {
    'N': 'S',
    'S': 'N',
    'E': 'W',
    'W': 'E'
  };
  return opposites[dir];
};

// Available basic path patterns for Hand tiles
export interface PathPattern {
  id: string;
  connections: Direction[];
  label: string;
}

export const PATH_PATTERNS: PathPattern[] = [
  { id: 'h-straight', connections: ['E', 'W'], label: '直線 ↔' },
  { id: 'v-straight', connections: ['N', 'S'], label: '直線 ↕' },
  { id: 'curve-ne', connections: ['N', 'E'], label: 'カーブ └' },
  { id: 'curve-es', connections: ['E', 'S'], label: 'カーブ ┌' },
  { id: 'curve-sw', connections: ['S', 'W'], label: 'カーブ ┐' },
  { id: 'curve-wn', connections: ['W', 'N'], label: 'カーブ ┘' }
];

// Rotate connections 90 degrees clockwise
export function rotateConnections(connections: Direction[]): Direction[] {
  const rotationMap: Record<Direction, Direction> = {
    'N': 'E',
    'E': 'S',
    'S': 'W',
    'W': 'N'
  };
  return connections.map(d => rotationMap[d]);
}

// Generates a grid with preset static tiles (specialties like weapons & enemies) 
// and fills the other slots as 'empty'
export function generateBoardTiles(stage: Stage): Tile[] {
  const size = stage.gridSize;
  const numGrid = size * size;
  const tiles: Tile[] = Array.from({ length: numGrid }, (_, i) => ({
    id: `tile_${stage.id}_${i}`,
    type: 'empty',
    connections: [],
    specialty: 'none',
    specialtyVisited: false,
    specialtyValue: 0,
    originalIndex: i
  }));

  // Construct specialties from stage configuration
  interface SpecItem {
    type: Tile['specialty'];
    name: string;
    value: number;
  }
  const specialtiesToPlace: SpecItem[] = [];
  stage.allowedSpecialties.forEach(spec => {
    for (let h = 0; h < spec.count; h++) {
      specialtiesToPlace.push({
        type: spec.type,
        name: spec.name,
        value: spec.value
      });
    }
  });

  // Distribute static specialties on the board at distinct cells avoiding adjacency
  const entryIndex = stage.startCastleRow * size;
  
  // Helper to check Manhattan distance strictly equals 1 (adjacent)
  const isAdjacent = (idx1: number, idx2: number) => {
    const r1 = Math.floor(idx1 / size);
    const c1 = idx1 % size;
    const r2 = Math.floor(idx2 / size);
    const c2 = idx2 % size;
    return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
  };

  const chosenIndices: number[] = [];
  const limit = Math.min(specialtiesToPlace.length, numGrid - 1);
  let found = false;

  // Attempt up to 200 times to find a completely non-adjacent set of placements
  for (let attempt = 0; attempt < 200; attempt++) {
    const pool = Array.from({ length: numGrid }, (_, i) => i).filter(i => i !== entryIndex);
    
    // Shuffle the pool of candidates
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const currentSelection: number[] = [];
    for (const candidate of pool) {
      if (currentSelection.length >= limit) break;
      const hasAdjacent = currentSelection.some(sel => isAdjacent(sel, candidate));
      if (!hasAdjacent) {
        currentSelection.push(candidate);
      }
    }

    if (currentSelection.length === limit) {
      chosenIndices.push(...currentSelection);
      found = true;
      break;
    }
  }

  // Fallback in case a completely distinct layout could not be solved in time (highly unlikely for these small grids)
  if (!found) {
    const pool = Array.from({ length: numGrid }, (_, i) => i).filter(i => i !== entryIndex);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    chosenIndices.push(...pool.slice(0, limit));
  }

  for (let idx = 0; idx < limit; idx++) {
    const tileIndex = chosenIndices[idx];
    const spec = specialtiesToPlace[idx];
    
    // Calculate row and col for the static tile to filter out directions pointing off-grid
    const row = Math.floor(tileIndex / size);
    const col = tileIndex % size;
    const possible: Direction[] = [];
    if (row > 0) possible.push('N');
    if (row < size - 1) possible.push('S');
    if (col < size - 1) possible.push('E');
    if (col > 0) possible.push('W');
    
    // Choose exactly 2 directions from possible to make this a simple 2-way path
    const shuffledDir = [...possible];
    for (let sIdx = shuffledDir.length - 1; sIdx > 0; sIdx--) {
      const jIdx = Math.floor(Math.random() * (sIdx + 1));
      [shuffledDir[sIdx], shuffledDir[jIdx]] = [shuffledDir[jIdx], shuffledDir[sIdx]];
    }
    const connections = shuffledDir.slice(0, 2);
    
    tiles[tileIndex] = {
      id: `tile_${stage.id}_static_${tileIndex}`,
      type: 'road',
      connections, // Always exactly 2 connections (simple curve or straight)
      specialty: spec.type,
      specialtyVisited: false,
      specialtyValue: spec.value,
      specialtyName: spec.name,
      originalIndex: tileIndex,
      isStatic: true
    };
  }

  return tiles;
}

// Check exits on a tile
export function getTileExitDirection(tile: Tile, enterDir: Direction): Direction | null {
  if (tile.type === 'empty') return null;
  const hasEntry = tile.connections.includes(enterDir);
  if (!hasEntry) return null;

  // Handle crossroad: straight preferred
  if (tile.connections.length === 4) {
    return getOppositeDirection(enterDir);
  }

  // Handle standard curves or straights by picking the OTHER connection
  const others = tile.connections.filter(d => d !== enterDir);
  if (others.length > 0) {
    return others[0];
  }

  return null;
}
