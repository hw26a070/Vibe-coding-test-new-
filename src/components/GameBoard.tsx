/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Tile, PlayerHero, Direction } from '../types';
import { rotateConnections, getTileExitDirection, getOppositeDirection } from '../utils/boardGenerator';
import { Castle, Flame, Sword, Sparkles, ShoppingBag, ShieldCheck, Trophy, HelpCircle, RotateCw, Trash2, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PixelIcon } from './PixelIcons';

interface GameBoardProps {
  tiles: Tile[];
  gridSize: number;
  hero: PlayerHero;
  startCastleRow: number;
  onPlaceTile: (index: number) => void;
  onRotateTile: (index: number) => void;
  onRemoveTile: (index: number) => void;
  floatingTexts: { id: string; text: string; row: number; col: number; colorClass: string }[];
  activeHandTileConnections: Direction[] | null;
}

/// Specialty tile custom themes in solid pixelated colors
const specialtyColors: Record<Tile['specialty'], { bg: string; border: string; text: string; icon: any }> = {
  none: { bg: 'bg-black', border: 'border-zinc-800', text: 'text-zinc-600', icon: null },
  forge: { bg: 'bg-[#250d02] border-2', border: 'border-amber-600', text: 'text-amber-400', icon: Sword },
  shop: { bg: 'bg-[#020d20] border-2', border: 'border-blue-500', text: 'text-blue-400', icon: ShoppingBag },
  chest: { bg: 'bg-[#1e1702] border-2', border: 'border-[#ffb800]', text: 'text-[#ffb800]', icon: Sparkles },
  dojo: { bg: 'bg-[#021c0b] border-2', border: 'border-emerald-500', text: 'text-emerald-400', icon: Flame },
  enemy: { bg: 'bg-[#2a0408] border-4', border: 'border-red-600', text: 'text-red-500', icon: ShieldCheck },
  fountain: { bg: 'bg-[#02171c] border-2', border: 'border-cyan-500', text: 'text-cyan-400', icon: Sparkles },
};

export const GameBoard: React.FC<GameBoardProps> = ({
  tiles,
  gridSize,
  hero,
  startCastleRow,
  onPlaceTile,
  onRotateTile,
  onRemoveTile,
  floatingTexts,
  activeHandTileConnections
}) => {
  // Sizing dictionary to fit beautifully on both small and large screens
  const sizeConfig = useMemo(() => {
    switch (gridSize) {
      case 3:
        return {
          tileClass: 'w-18 h-18 sm:w-22 sm:h-22 text-xs',
          gridWidthClass: 'grid-cols-3 w-[220px] sm:w-[270px]',
          rawTileWidth: window.innerWidth < 640 ? 72 : 88,
        };
      case 4:
        return {
          tileClass: 'w-14 h-14 sm:w-16 sm:h-16 text-xs',
          gridWidthClass: 'grid-cols-4 w-[230px] sm:w-[270px]',
          rawTileWidth: window.innerWidth < 640 ? 56 : 64,
        };
      case 5:
        return {
          tileClass: 'w-12 h-12 sm:w-14 sm:h-14 text-[10px]',
          gridWidthClass: 'grid-cols-5 w-[240px] sm:w-[290px]',
          rawTileWidth: window.innerWidth < 640 ? 48 : 56,
        };
      case 6:
      default:
        return {
          tileClass: 'w-10 h-10 sm:w-12 sm:h-12 text-[9px]',
          gridWidthClass: 'grid-cols-6 w-[245px] sm:w-[295px]',
          rawTileWidth: window.innerWidth < 640 ? 40 : 48,
        };
    }
  }, [gridSize]);

  const tileWidth = sizeConfig.rawTileWidth;

  // Draws SVG road based on connections direction list in flat pixel themes
  const renderRoadPath = (connections: Direction[], isCurrentlyOnHeroPath: boolean, opacityClass = "opacity-100") => {
    const strokeColor = isCurrentlyOnHeroPath ? '#ffb800' : '#444455'; // glowing gold vs silent charcoal
    const innerColor = isCurrentlyOnHeroPath ? '#ffffff' : '#666677';  // bright white inner vs muted silver
    
    return (
      <svg className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300 ${opacityClass}`} viewBox="0 0 100 100">
        {/* Outer dark road bed */}
        {connections.map((dir, idx) => {
          let pathD = '';
          if (dir === 'N') pathD = 'M 50,0 L 50,50';
          if (dir === 'S') pathD = 'M 50,50 L 50,100';
          if (dir === 'E') pathD = 'M 50,50 L 100,50';
          if (dir === 'W') pathD = 'M 0,50 L 50,50';
          return (
            <path
              key={`road-bed-${dir}-${idx}`}
              d={pathD}
              stroke="#000000"
              strokeWidth="24"
              strokeLinecap="square"
            />
          );
        })}

        {/* Main Paving */}
        {connections.map((dir, idx) => {
          let pathD = '';
          if (dir === 'N') pathD = 'M 50,0 L 50,50';
          if (dir === 'S') pathD = 'M 50,50 L 50,100';
          if (dir === 'E') pathD = 'M 50,50 L 100,50';
          if (dir === 'W') pathD = 'M 0,50 L 50,50';
          return (
            <path
              key={`road-pave-${dir}-${idx}`}
              d={pathD}
              stroke={strokeColor}
              strokeWidth="16"
              strokeLinecap="square"
              className={isCurrentlyOnHeroPath ? 'animate-[pulse_1.5s_infinite]' : ''}
            />
          );
        })}

        {/* Center line (Dash design) */}
        {connections.map((dir, idx) => {
          let pathD = '';
          if (dir === 'N') pathD = 'M 50,0 L 50,50';
          if (dir === 'S') pathD = 'M 50,50 L 50,100';
          if (dir === 'E') pathD = 'M 50,50 L 100,50';
          if (dir === 'W') pathD = 'M 0,50 L 50,50';
          return (
            <path
              key={`road-center-${dir}-${idx}`}
              d={pathD}
              stroke={innerColor}
              strokeWidth="4"
              strokeDasharray="8,6"
              strokeLinecap="square"
            />
          );
        })}
        
        {/* Hub cap */}
        {connections.length > 0 && (
          <rect x="40" y="40" width="20" height="20" fill={isCurrentlyOnHeroPath ? '#ffb800' : '#222233'} stroke="#000000" strokeWidth="4" />
        )}
      </svg>
    );
  };

  // Predictive walkthrough route calculation
  const predictedPath = useMemo(() => {
    const path: { row: number; col: number; entryDirection: Direction; exitDirection: Direction }[] = [];
    const visited = new Set<string>();

    let activeRow = 0;
    let activeCol = 0;
    let activeEnter: Direction | null = null;

    if (hero.position === 'start') {
      activeRow = startCastleRow;
      activeCol = 0;
      activeEnter = 'W';
    } else if (typeof hero.position === 'object') {
      activeRow = hero.position.row;
      activeCol = hero.position.col;
      activeEnter = hero.entryDirection;
    } else {
      return [];
    }

    let steps = 0;
    const maxSteps = gridSize * gridSize * 3;

    while (steps < maxSteps && activeEnter) {
      const tileIndex = activeRow * gridSize + activeCol;
      const tile = tiles[tileIndex];
      if (!tile || tile.type === 'empty') break;

      const key = `${activeRow},${activeCol}`;
      if (visited.has(key)) {
        break; 
      }
      visited.add(key);

      const exitD = getTileExitDirection(tile, activeEnter);
      if (!exitD) break;

      path.push({
        row: activeRow,
        col: activeCol,
        entryDirection: activeEnter,
        exitDirection: exitD
      });

      // Next grid block
      let nextRow = activeRow;
      let nextCol = activeCol;
      if (exitD === 'N') nextRow -= 1;
      if (exitD === 'S') nextRow += 1;
      if (exitD === 'E') nextCol += 1;
      if (exitD === 'W') nextCol -= 1;

      if (nextRow < 0 || nextRow >= gridSize || nextCol < 0 || nextCol >= gridSize) {
        break;
      }

      const nextTileIdx = nextRow * gridSize + nextCol;
      const nextTile = tiles[nextTileIdx];
      const neededEntry = getOppositeDirection(exitD);

      if (nextTile && nextTile.type !== 'empty' && nextTile.connections.includes(neededEntry)) {
        activeRow = nextRow;
        activeCol = nextCol;
        activeEnter = neededEntry;
      } else {
        break;
      }

      steps++;
    }

    return path;
  }, [tiles, gridSize, hero.position, hero.entryDirection, startCastleRow]);

  const isHeroOccupying = (row: number, col: number) => {
    if (typeof hero.position === 'string') return false;
    return hero.position.row === row && hero.position.col === col;
  };

  const isTileInPathHistory = (row: number, col: number) => {
    return hero.pathHistory.some(p => p.row === row && p.col === col);
  };

  // Compute avatar offsets
  const heroPixels = useMemo(() => {
    const W = tileWidth;
    const gap = 6;
    const pl = W * 0.75 + 24; 
    const pt = 10;            

    let x = 0;
    let y = 0;

    if (hero.position === 'start') {
      const castleWidth = W * 0.75;
      const castleLeft = 12;
      x = castleLeft + castleWidth / 2;
      y = pt + startCastleRow * (W + gap) + W / 2;
    } else if (hero.position === 'goal') {
      x = pl + gridSize * (W + gap) - gap + W / 2;
      y = pt + startCastleRow * (W + gap) + W / 2;
    } else {
      const { row, col } = hero.position;
      const x0 = pl + col * (W + gap);
      const y0 = pt + row * (W + gap);
      
      const enterD = hero.entryDirection;
      const exitD = hero.exitDirection;

      if (hero.subPosition === 'entering' && enterD) {
        let dx = 0.5;
        let dy = 0.5;
        if (enterD === 'N') { dx = 0.5; dy = 0.15; }
        if (enterD === 'S') { dx = 0.5; dy = 0.85; }
        if (enterD === 'E') { dx = 0.85; dy = 0.5; }
        if (enterD === 'W') { dx = 0.15; dy = 0.5; }
        x = x0 + dx * W;
        y = y0 + dy * W;
      } else if (hero.subPosition === 'exiting' && exitD) {
        let dx = 0.5;
        let dy = 0.5;
        if (exitD === 'N') { dx = 0.5; dy = 0.15; }
        if (exitD === 'S') { dx = 0.5; dy = 0.85; }
        if (exitD === 'E') { dx = 0.85; dy = 0.5; }
        if (exitD === 'W') { dx = 0.15; dy = 0.5; }
        x = x0 + dx * W;
        y = y0 + dy * W;
      } else {
        x = x0 + 0.5 * W;
        y = y0 + 0.5 * W;
      }
    }

    return { x, y };
  }, [hero.position, hero.subPosition, hero.entryDirection, hero.exitDirection, tileWidth, gridSize, startCastleRow]);

  return (
    <div id="game-board-container" className="nes-panel crt-grid p-2.5 text-[#e0e0e0] flex flex-col items-center justify-center">

      <div className="relative flex items-center justify-center select-none">
        
        {/* ACTIVE GRID CANVAS */}
        <div 
          id="sliding-grid-wrap"
          className="relative border-4 border-white bg-black p-2.5 pr-4 shadow-2xl rounded-none"
          style={{ paddingLeft: `${tileWidth * 0.75 + 24}px` }}
        >
          
          {/* DOCKED START CASTLE */}
          <div 
            className="absolute flex flex-col items-center justify-center text-center z-10"
            style={{
              left: `12px`,
              top: `${10 + startCastleRow * (tileWidth + 6) + (tileWidth - tileWidth * 0.75) / 2}px`,
              width: `${tileWidth * 0.75}px`,
              height: `${tileWidth * 0.75}px`
            }}
          >
            <div className={`p-1.5 border-4 transition-all rounded-none ${
              hero.position === 'start' 
                ? 'bg-[#ffb800] text-black border-white animate-pulse' 
                : 'bg-black text-white border-zinc-700'
            }`}>
              <Castle size={Math.max(14, tileWidth / 3.8)} />
            </div>
            <span className="text-[7px] text-zinc-400 mt-1 font-press tracking-tighter whitespace-nowrap">START</span>
            
            <svg 
              className="absolute pointer-events-none" 
              style={{ 
                left: `${tileWidth * 0.75}px`, 
                width: `${24}px`, 
                height: `${8}px`,
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            >
              <line 
                x1="0" 
                y1="50%" 
                x2="100%" 
                y2="50%" 
                stroke={hero.position === 'start' || hero.pathHistory.length > 0 ? '#ffb800' : '#444'} 
                strokeWidth="6" 
              />
            </svg>
          </div>

          <div className={`grid ${sizeConfig.gridWidthClass} gap-1.5`}>
            {tiles.map((tile, index) => {
              const row = Math.floor(index / gridSize);
              const col = index % gridSize;
              
              const isHeroHere = isHeroOccupying(row, col);
              const isVisited = tile.specialtyVisited;
              const hasPassed = isTileInPathHistory(row, col);
              const spec = specialtyColors[tile.specialty];

              // Handle empty placement slots
              if (tile.type === 'empty') {
                return (
                  <motion.div
                    key={`empty-${index}`}
                    onClick={() => onPlaceTile(index)}
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 184, 0, 0.08)' }}
                    whileTap={{ scale: 0.98 }}
                    className={`${sizeConfig.tileClass} relative bg-[#09090c] border-2 border-dashed border-zinc-800 rounded-none transition-all cursor-pointer flex items-center justify-center group`}
                  >
                    {/* Ghost preview of selected hand tile */}
                    {activeHandTileConnections && (
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-35 transition-opacity duration-200">
                        {renderRoadPath(activeHandTileConnections, false, "opacity-100")}
                      </div>
                    )}
                    
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-press text-white bg-black px-1.5 py-1 border-2 border-white">
                      SET
                    </span>

                    <div className="absolute bottom-0.5 right-1 text-[7px] font-mono text-zinc-800">
                      {row},{col}
                    </div>
                  </motion.div>
                );
              }

              // Placed road node
              return (
                <motion.div
                  key={tile.id}
                  id={`tile-index-${index}`}
                  className={`${sizeConfig.tileClass} relative rounded-none bg-[#11111a] overflow-hidden flex flex-col items-center justify-center border-4 select-none group ${
                    tile.isStatic
                      ? 'border-neutral-500'
                      : 'border-[#ffb800]'
                  } ${isHeroHere ? 'ring-4 ring-white shadow-xl' : ''}`}
                >
                  {/* Grid background mesh */}
                  <div className="absolute inset-0 bg-[radial-gradient(#1e2025_1px,transparent_1px)] [background-size:12px_12px] opacity-20 pointer-events-none" />

                  {/* Draw the connected paths */}
                  {renderRoadPath(tile.connections, isHeroHere || hasPassed)}

                  {/* Specialty Weapons or Monsters */}
                  {tile.specialty !== 'none' && (
                    <div 
                      className={`relative z-10 flex flex-col items-center p-1 border-2 rounded-none scale-90 sm:scale-100 ${spec.bg} ${spec.border} ${isVisited ? 'opacity-25 saturate-50' : ''}`}
                    >
                      {spec.icon && (
                        <spec.icon size={gridSize >= 5 ? 11 : 14} className={`${spec.text} mb-0.5`} />
                      )}
                      
                      <span className="text-[8px] font-press font-bold text-white tracking-tighter whitespace-nowrap leading-none">
                        {tile.specialty === 'enemy' ? (
                          <span className="text-red-400 font-bold">P{tile.specialtyValue}</span>
                        ) : tile.specialty === 'dojo' || tile.specialty === 'fountain' ? (
                          `X${tile.specialtyValue}`
                        ) : (
                          `+${tile.specialtyValue}`
                        )}
                      </span>
                    </div>
                  )}

                  {/* Tile controls */}
                  {!tile.isStatic && !isHeroHere && (
                    <div className="absolute inset-0 bg-black/95 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 z-20">
                      {/* Rotate Option */}
                      <button
                        title="90度回転"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRotateTile(index);
                        }}
                        className="retro-btn text-[8px] p-1 border hover:bg-[#ffb800] hover:text-black"
                      >
                        <RotateCw size={10} />
                      </button>

                      {/* Remove Option */}
                      <button
                        title="撤去する"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveTile(index);
                        }}
                        className="retro-btn border-red-500 text-red-400 p-1 hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  )}

                  {/* Static Preset tag */}
                  {tile.isStatic && (
                    <div className="absolute top-0.5 left-1 text-[6px] text-zinc-500 font-press font-bold">
                      FIX
                    </div>
                  )}

                  {/* Coordinate labels */}
                  <div className="absolute bottom-0.5 right-1 pointer-events-none text-[8px] font-mono text-zinc-850">
                    {row},{col}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* DYNAMIC FIGHT/BUFF FLOATING POPUPS */}
          <AnimatePresence>
            {floatingTexts.map((f) => {
              const topVal = 10 + f.row * (tileWidth + 6) + tileWidth / 6;
              const leftVal = (tileWidth * 0.75 + 24) + f.col * (tileWidth + 6) + tileWidth / 8;
              return (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 15, scale: 0.8 }}
                  animate={{ opacity: 1, y: -25, scale: 1.1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className={`absolute z-30 font-press font-bold text-[9px] bg-black px-2 py-1 border-2 border-white text-center shadow-lg ${f.colorClass}`}
                  style={{
                    top: `${topVal}px`,
                    left: `${leftVal}px`,
                  }}
                >
                  {f.text}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* REALTIME WALKING AVATAR */}
          <motion.div
            id="hero-piece-avatar"
            className="absolute pointer-events-none z-20"
            animate={{
              x: heroPixels.x - (tileWidth * 0.45) / 2,
              y: heroPixels.y - (tileWidth * 0.45) / 2
            }}
            transition={{
              type: "spring",
              stiffness: 140,
              damping: 15
            }}
            style={{
              width: `${tileWidth * 0.45}px`,
              height: `${tileWidth * 0.45}px`,
              top: 0,
              left: 0
            }}
          >
            <div className={`relative w-full h-full rounded-none flex items-center justify-center border-4 transition-transform duration-300 shadow-xl ${
              hero.status === 'blocked' 
                ? 'bg-amber-950 border-[#ffb800]' 
                : hero.status === 'defeated'
                ? 'bg-red-950 border-red-500'
                : hero.status === 'victory'
                ? 'bg-emerald-950 border-emerald-400'
                : 'bg-black border-white'
            }`}>
              <Shield size={Math.max(12, tileWidth * 0.22)} className="text-white fill-[#ffb800]" />

              {/* Sweat drop popup */}
              {hero.status === 'blocked' && (
                <div className="absolute -top-6 px-1.5 py-0.5 bg-black border border-white text-white font-press text-[6px] whitespace-nowrap">
                  LOST?
                </div>
              )}

              {/* Sparkle if walking */}
              {hero.status === 'walking' && (
                <span className="absolute -bottom-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-[#ffb800] opacity-75"></span>
                  <span className="relative inline-flex rounded-none h-2.5 w-2.5 bg-[#ffb800]"></span>
                </span>
              )}
            </div>

            {/* Float Power HUD */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-black border-2 border-white rounded-none px-1 py-0.5 text-center shadow whitespace-nowrap">
              <span className="text-[7px] font-press font-bold text-[#ffb800]">{hero.power}</span>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};
