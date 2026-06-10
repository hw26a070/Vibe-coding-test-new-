/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlayerHero, Tile } from '../types';
import { Swords, CheckCircle2, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface EnemiesTrackerProps {
  hero: PlayerHero;
  tiles: Tile[];
  battleLog: string[];
}

interface PixelGrid {
  colorMap: Record<string, string>;
  grid: string[];
}

const getMonsterPixels = (name: string): PixelGrid => {
  const lowercase = name.toLowerCase();
  if (lowercase.includes('slime') || lowercase.includes('スライム')) {
    return {
      colorMap: {
        '1': '#00ff66', // emerald/green slime
        '2': '#ffffff', // shiny highlights
      },
      grid: [
        "00011000",
        "00111100",
        "01111110",
        "11111111",
        "11111111",
        "11111111",
        "11111111",
        "01111110"
      ]
    };
  }
  if (lowercase.includes('goblin') || lowercase.includes('ゴブリン')) {
    return {
      colorMap: {
        '1': '#a3e635', // lime/light green
        '2': '#ef4444', // red eyes
      },
      grid: [
        "10000001",
        "11011011",
        "01111110",
        "01212110",
        "01111110",
        "00111100",
        "00011000",
        "00000000"
      ]
    };
  }
  if (lowercase.includes('skeleton') || lowercase.includes('骸骨')) {
    return {
      colorMap: {
        '1': '#f4f4f5', // off-white bones
        '2': '#18181b', // dark eyes
      },
      grid: [
        "00111100",
        "01111110",
        "11211211",
        "11111111",
        "01111110",
        "01212120",
        "01010120",
        "00000000"
      ]
    };
  }
  if (lowercase.includes('orc') || lowercase.includes('オーク')) {
    return {
      colorMap: {
        '1': '#b45309', // amber/brown pig face
        '2': '#ffffff', // white tusks
        '3': '#ef4444', // red details
      },
      grid: [
        "10000001",
        "11000011",
        "01111110",
        "01311310",
        "01111110",
        "01100110",
        "00122100",
        "00000000"
      ]
    };
  }
  if (lowercase.includes('golem') || lowercase.includes('ゴーレム')) {
    return {
      colorMap: {
        '1': '#71717a', // stone zinc
        '2': '#eab308', // glowing yellow eyes
      },
      grid: [
        "01111110",
        "11111111",
        "11111111",
        "12111121",
        "11111111",
        "11100111",
        "01111110",
        "00111100"
      ]
    };
  }
  if (lowercase.includes('knight') || lowercase.includes('騎士')) {
    return {
      colorMap: {
        '1': '#cbd5e1', // steel/blue-gray
        '2': '#facc15', // gold visor slit
      },
      grid: [
        "00011000",
        "00111100",
        "01111110",
        "01122110",
        "11122111",
        "11111111",
        "01111110",
        "00111100"
      ]
    };
  }
  if (lowercase.includes('apostle') || lowercase.includes('アポストル')) {
    return {
      colorMap: {
        '1': '#a855f7', // purple
        '2': '#f43f5e', // deep red/rose eyes
      },
      grid: [
        "10000001",
        "01000010",
        "01111110",
        "11211211",
        "11111111",
        "11111111",
        "01101110",
        "00011000"
      ]
    };
  }
  if (lowercase.includes('lucifer') || lowercase.includes('魔王')) {
    return {
      colorMap: {
        '1': '#dc2626', // dark red
        '2': '#facc15', // gold crown peaks
        '3': '#18181b', // dark eyes
      },
      grid: [
        "20202020",
        "12121211",
        "11111111",
        "11311311",
        "11111111",
        "11100111",
        "01111110",
        "00111100"
      ]
    };
  }
  // Default alien/monster
  return {
    colorMap: {
      '1': '#ec4899', // pink invader
      '2': '#ffffff', // white eyes
    },
    grid: [
      "00100100",
      "10111101",
      "11122111",
      "11111111",
      "01111110",
      "00100100",
      "01000010",
      "10000001"
    ]
  };
};

export const MonsterPixelIcon: React.FC<{ name: string; size?: number }> = ({ name, size = 18 }) => {
  const pixels = getMonsterPixels(name);
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 8 8" 
      shapeRendering="crispEdges"
      className="shrink-0"
    >
      {pixels.grid.map((row, rIdx) => (
        <React.Fragment key={`row-${rIdx}`}>
          {row.split('').map((char, cIdx) => {
            if (char === '0') return null;
            const fill = pixels.colorMap[char];
            return (
              <rect 
                key={`pixel-${rIdx}-${cIdx}`} 
                x={cIdx} 
                y={rIdx} 
                width={1} 
                height={1} 
                fill={fill} 
              />
            );
          })}
        </React.Fragment>
      ))}
    </svg>
  );
};

export const EnemiesTracker: React.FC<EnemiesTrackerProps> = ({
  hero,
  tiles,
  battleLog
}) => {
  // Extract all enemy tiles currently instantiated on the board
  const enemyTiles = tiles
    .filter(t => t.specialty === 'enemy')
    .map(t => ({
      id: t.id,
      name: t.specialtyName || '悪名高き魔物',
      power: t.specialtyValue,
      defeated: t.specialtyVisited,
      row: Math.floor(t.originalIndex / Math.sqrt(tiles.length)),
      col: t.originalIndex % Math.sqrt(tiles.length)
    }))
    .sort((a, b) => a.power - b.power);

  const totalEnemiesCount = enemyTiles.length;
  const defeatedCount = enemyTiles.filter(e => e.defeated).length;
  const allClear = totalEnemiesCount > 0 && defeatedCount === totalEnemiesCount;

  return (
    <div id="enemies-tracker-panel" className="nes-panel p-4 text-[#e0e0e0] flex flex-col h-full min-h-[500px]">
      
      {/* Title Header */}
      <div className="border-b-4 border-double border-white pb-3 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <span className="text-[8px] text-zinc-400 font-press tracking-widest block mb-1">TARGETS LIST</span>
          <h2 className="text-sm font-bold text-red-500 flex items-center gap-2 font-press">
            <Swords size={14} className="text-red-500 animate-pulse" />
            <span>指名手配魔物</span>
          </h2>
        </div>
        
        {/* Progress Badge */}
        <div className="text-[8px] bg-black text-[#ffb800] px-2.5 py-1.5 border-2 border-white font-press">
          DEFEAT: {defeatedCount} / {totalEnemiesCount}
        </div>
      </div>

      {/* Target Objectives Section */}
      <div className="flex-1 flex flex-col gap-2.5 bg-black p-3 border-2 border-zinc-700 shadow-inner overflow-y-auto mb-4 min-h-[220px]">
        <div className="text-[10px] text-zinc-300 mb-1 font-bold tracking-wider flex items-center gap-1">
          <span>※ 討伐可能：【勇者戦力 [POW] ≧ 魔物戦闘力】</span>
        </div>

        {enemyTiles.length === 0 ? (
          <div className="text-zinc-500 font-press italic text-center py-10 text-[9px]">NO MONSTERS YET...</div>
        ) : (
          enemyTiles.map((enemy, idx) => {
            const isDefeated = enemy.defeated;
            const canDefeat = hero.power >= enemy.power;
            
            let cardBg = "bg-zinc-950 border-neutral-700";
            let powerBadgeColor = "bg-neutral-900 text-zinc-400 border-neutral-700";
            
            if (isDefeated) {
              cardBg = "bg-neutral-900 border-zinc-800 opacity-40 line-through decoration-[#4e9f50] border-dashed";
              powerBadgeColor = "bg-[#102a18] text-emerald-400 border-zinc-800";
            } else if (!canDefeat) {
              cardBg = "bg-red-950/20 border-red-900 ring-1 ring-red-950/40";
              powerBadgeColor = "bg-red-950 text-red-400 border-red-700";
            } else {
              cardBg = "bg-[#102d18]/20 border-emerald-800";
              powerBadgeColor = "bg-[#102a18] text-emerald-400 border-emerald-600";
            }

            return (
              <motion.div
                key={`tracker-enemy-${enemy.id}-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-center justify-between p-2.5 rounded-none border-2 transition-all ${cardBg}`}
              >
                <div className="flex items-center gap-2.5">
                  <MonsterPixelIcon name={enemy.name} size={20} />
                  <div>
                    <h3 className="font-bold text-xs text-white">{enemy.name}</h3>
                    <p className="text-[9px] text-zinc-500 font-mono">
                      座標: ({enemy.row}, {enemy.col}) {!isDefeated && (canDefeat ? ' [OK]' : ' [NG]')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isDefeated ? (
                    <CheckCircle2 size={12} className="text-emerald-400" />
                  ) : (
                    <span className="text-[7px] font-press px-1 py-0.5 rounded-none text-red-500 font-bold bg-black border border-red-500">WANTED</span>
                  )}
                  <div className={`px-2 py-0.5 text-[10px] font-press font-bold rounded-none border-2 flex items-center gap-1 ${powerBadgeColor}`}>
                    <Swords size={11} />
                    <span>{enemy.power}</span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Real-time Battle Logs Terminal */}
      <h3 className="text-[8px] text-red-500 font-press tracking-widest uppercase mb-1.5 flex items-center gap-1">
        <ShieldAlert size={11} className="text-red-500" strokeWidth={2.5} />
        <span>BATTLE ACTION TRANSMISSION</span>
      </h3>
      <div className="bg-black rounded-none p-3 border-2 border-white h-36 overflow-y-auto mb-1 font-mono text-[11px] flex flex-col gap-1 text-[#00ff66] shadow-inner">
        {battleLog.length === 0 ? (
          <div className="text-zinc-600 italic text-center py-8 text-[10px] font-sans leading-relaxed">
            勇者を出発させると、<br/>
            行動や戦闘ログがリアルタイム実況されます！
          </div>
        ) : (
          battleLog.map((log, index) => (
            <div key={`log-${index}`} className={`pb-1 leading-relaxed text-[11px] border-b border-zinc-800 last:border-0 ${
              log.includes('勝利') || log.includes('撃破成功!') || log.includes('クリア') ? 'text-emerald-400 font-bold' : 
              log.includes('敗北') || log.includes('ゲームオーバー') || log.includes('落ちました') ? 'text-red-400 font-bold' : 
              log.includes('獲得') || log.includes('鍛錬') || log.includes('倍増') ? 'text-amber-400 font-bold' : 'text-zinc-300'
            }`}>
              {log}
            </div>
          ))
        )}
      </div>

      {allClear && (
        <div className="mt-2 p-2 bg-[#092211] border-2 border-emerald-500 text-emerald-300 rounded-none text-[10px] font-mono font-bold text-center leading-relaxed animate-pulse">
          STAGE ALL CLEAR !! ALL REMAINING MONSTERS SLAIN !!
        </div>
      )}

    </div>
  );
};
