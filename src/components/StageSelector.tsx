/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Stage } from '../types';
import { Award, Star, ListCollapse, Compass, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface StageSelectorProps {
  stages: Stage[];
  currentStageId: number;
  completedStages: number[]; // e.g. [1, 2]
  onSelectStage: (stageId: number) => void;
}

export const StageSelector: React.FC<StageSelectorProps> = ({
  stages,
  currentStageId,
  completedStages,
  onSelectStage
}) => {
  return (
    <div id="stage-selector-wrap" className="nes-panel p-5 text-[#e0e0e0] max-w-full">
      
      {/* Selector Header */}
      <div className="border-b-4 border-double border-white pb-3.5 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Compass size={18} className="text-gold-accent" />
          <h2 className="text-sm font-bold tracking-wider text-gold-accent font-press">STAGES SELECT</h2>
        </div>
        
        {/* Progress badge */}
        <span className="text-[10px] bg-black px-3 py-1.5 border-2 border-white font-press text-white">
          COMPLETED: <span className="text-gold-accent font-bold">{Math.round((completedStages.length / stages.length) * 100)}%</span>
        </span>
      </div>

      {/* Grid listing the levels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {stages.map((stg) => {
          const isSelected = stg.id === currentStageId;
          const isCompleted = completedStages.includes(stg.id);
          const isUnlocked = stg.id === 1 || completedStages.includes(stg.id - 1) || isCompleted;

          // Compute highest power needed from allowed enemies
          const enemySpecialties = stg.allowedSpecialties.filter(spec => spec.type === 'enemy');
          const bossMaxPower = enemySpecialties.length > 0
            ? Math.max(...enemySpecialties.map(spec => spec.value))
            : 0;

          return (
            <button
              key={`stg-btn-${stg.id}`}
              id={`stage-card-${stg.id}`}
              disabled={!isUnlocked}
              onClick={() => onSelectStage(stg.id)}
              className={`flex flex-col text-left p-4 rounded-none border-4 transition-all select-none relative group ${
                !isUnlocked 
                  ? 'bg-neutral-900 border-neutral-700 opacity-30 cursor-not-allowed'
                  : isSelected
                  ? 'bg-amber-950/20 border-[#ffb800] ring-2 ring-black shadow-[rgba(255,184,0,0.15)_0_0_12px]'
                  : 'bg-black border-white hover:border-[#ff9f00] cursor-pointer'
              }`}
            >
              
              {/* Star rating for completed states */}
              {isCompleted && (
                <div className="absolute top-2 right-2 text-gold-accent flex items-center bg-black px-1.5 py-0.5 border-2 border-[#ffb800] text-[8px] font-press tracking-tighter">
                  <span className="text-[7px]">★</span>
                  <span>CLR</span>
                </div>
              )}

              <div className="text-[8px] text-zinc-400 font-bold font-press tracking-wider uppercase mb-1 flex items-center gap-1.5">
                <span>STG {stg.id}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 bg-[#ffb800] rounded-none animate-pulse" />
                )}
              </div>

              <h3 className={`font-bold text-xs truncate max-w-full ${isSelected ? 'text-gold-accent' : 'text-white'}`}>
                {stg.name.split(' (')[0]}
              </h3>

              <div className="flex flex-col gap-1 mt-2.5 text-[9px] text-zinc-400 border-t-2 border-dashed border-zinc-700 pt-2 w-full font-press">
                <div className="flex justify-between">
                  <span>SIZE:</span>
                  <strong className="text-white">{stg.gridSize}x{stg.gridSize}</strong>
                </div>
                <div className="flex justify-between">
                  <span>BOSS:</span>
                  <strong className="text-[#ffb800]">P{bossMaxPower}</strong>
                </div>
              </div>

              {/* Locked overlay badge */}
              {!isUnlocked && (
                <div className="absolute inset-0 bg-neutral-950/95 flex flex-col items-center justify-center text-zinc-500 transition-opacity">
                  <span className="text-[8px] font-press tracking-widest text-[#a6a6b1] mb-1 font-bold">LOCKED</span>
                  <span className="text-[8px] text-neutral-400">要・クリア</span>
                </div>
              )}

              {/* Arrow transition on hover */}
              {isUnlocked && !isSelected && (
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 text-[#ffb800] transition-opacity">
                  <ArrowRight size={14} className="animate-bounce" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
