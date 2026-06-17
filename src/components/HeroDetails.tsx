/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlayerHero, GameSettings } from '../types';
import { Shield, Sword, Heart, Volume2, VolumeX, Eye, Play, Square, FastForward, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import heroAvatarImg from '../../public/Gemini_Generated_Image_lxmep7lxmep7lxme.png';

interface HeroDetailsProps {
  hero: PlayerHero;
  settings: GameSettings;
  onToggleMute: () => void;
  onSpeedChange: (speed: number) => void;
  onResetHero: () => void;
  onStartWalking: () => void;
  onPauseWalking: () => void;
}

export const HeroDetails: React.FC<HeroDetailsProps> = ({
  hero,
  settings,
  onToggleMute,
  onSpeedChange,
  onResetHero,
  onStartWalking,
  onPauseWalking
}) => {
  // Helper to choose corresponding color for status
  const getStatusBadge = () => {
    switch (hero.status) {
      case 'idle':
        return { text: '出撃待機中', color: 'bg-obsidian-deep text-gold-muted border-obsidian-border' };
      case 'walking':
        return { text: '進行中...', color: 'bg-[#133020] text-emerald-400 border-emerald-900/50 animate-pulse' };
      case 'blocked':
        return { text: '道が途切れている！', color: 'bg-[#3f200c] text-gold-accent border-amber-900/30' };
      case 'battling':
        return { text: '魔物と交戦中 [BATTLE]', color: 'bg-[#401212] text-red-400 border-red-900/40 animate-pulse' };
      case 'victory':
        return { text: '完全制覇！ビクトリー！ [VICTORY]', color: 'bg-gradient-to-r from-[#382b0e] to-obsidian-panel text-gold-accent border-gold-accent/30 font-serif' };
      case 'defeated':
        return { text: '敗北... 修行し直そう！', color: 'bg-[#3c0c0c] text-red-405 border-red-900/50' };
    }
  };

  const statusInfo = getStatusBadge();

  // Helper for weapon description based on power levels
  const getWeaponAndShield = (pow: number) => {
    let weapon = 'ひのきの棒';
    let shield = '布の服';
    if (pow >= 1000) {
      weapon = '滅魔 of 神殺し大剣';
      shield = '極神アストラルアーマー';
    } else if (pow >= 500) {
      weapon = '天空聖剣エクスカリバー';
      shield = 'ドラゴンベイル甲冑';
    } else if (pow >= 250) {
      weapon = 'ルーンブレイド';
      shield = '神無の盾';
    } else if (pow >= 100) {
      weapon = '鋼鉄の斬魔剣';
      shield = '騎士の鉄鎧';
    } else if (pow >= 40) {
      weapon = '青銅の長剣';
      shield = 'カサカサの革鎧';
    }
    return { weapon, shield };
  };

  const gear = getWeaponAndShield(hero.power);

  return (
    <div id="hero-details" className="nes-panel p-2 text-[#e0e0e0] max-w-full">
      {/* Dynamic Grid: HUD style */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
        
        {/* Section A: Hero Stats & Gear */}
        <div className="md:col-span-5 flex items-center justify-between sm:justify-start gap-3 border-b md:border-b-0 md:border-r border-zinc-800 pb-1.5 md:pb-0 md:pr-3">
          <div className="flex items-center gap-2">
            <img 
              src={heroAvatarImg} 
              alt="Hero Icon" 
              className="w-5 h-5 object-cover border-2 border-[#ffb800] bg-black shrink-0" 
              referrerPolicy="no-referrer"
            />
            <span className="text-[9px] font-press font-bold text-white whitespace-nowrap">LV.{hero.level}</span>
            <span className="text-xs font-press font-black text-[#ffb800] bg-black px-1.5 py-0.5 border border-zinc-700">
              {hero.power}<span className="text-[7px] text-zinc-500 font-normal ml-0.5">P</span>
            </span>
          </div>

          <div className="flex flex-col text-[9px] truncate max-w-[150px] sm:max-w-none text-left">
            <span className="text-zinc-500 font-mono flex items-center gap-1 truncate">
              <Sword size={8} className="text-[#ffb800] shrink-0" /> {gear.weapon}
            </span>
            <span className="text-zinc-500 font-mono flex items-center gap-1 truncate">
              <Shield size={8} className="text-blue-400" shrink-0 /> {gear.shield}
            </span>
          </div>
        </div>

        {/* Section B: Activity Status & Speed */}
        <div className="md:col-span-4 flex items-center justify-between md:justify-center gap-2 border-b md:border-b-0 md:border-r border-zinc-800 pb-1.5 md:pb-0 md:px-3">
          {/* Compact Activity text */}
          <div className={`text-[8px] font-press px-1.5 py-0.5 text-center font-bold tracking-tight bg-neutral-900 border border-zinc-700 whitespace-nowrap truncate max-w-[140px] md:max-w-none flex-1 ${statusInfo.color.replace('bg-obsidian-deep', '').replace('p-4', '')}`}>
            {statusInfo.text}
          </div>

          {/* Speed picker */}
          <div className="flex items-center bg-neutral-950 border border-zinc-700 p-0.5 shrink-0">
            <span className="text-[6px] text-zinc-600 px-1 font-press font-bold">SP:</span>
            {[1, 1.5, 2.5].map((speed) => (
              <button
                key={speed}
                id={`speed-btn-${speed}`}
                onClick={() => onSpeedChange(speed)}
                className={`px-1 py-0.5 text-[7px] font-press transition-all cursor-pointer ${
                  settings.gameSpeed === speed
                    ? 'bg-[#ffb800] text-black font-bold border border-white'
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                x{speed}
              </button>
            ))}
          </div>
        </div>

        {/* Section C: Guide Actions (Start/Pause/Restart/Mute) */}
        <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-1.5 pt-1 md:pt-0">
          <button
            onClick={onToggleMute}
            className="retro-btn p-1 text-[8px] flex items-center justify-center cursor-pointer shrink-0"
            title={settings.isMuted ? 'SOUND OFF' : 'SOUND ON'}
          >
            {settings.isMuted ? <VolumeX size={10} /> : <Volume2 size={10} />}
          </button>

          <button
            onClick={onResetHero}
            className="retro-btn border-red-500 text-red-400 font-press text-[8px] font-bold py-0.5 px-2 cursor-pointer flex items-center gap-1 hover:bg-red-950/25 shrink-0"
            title="最初からリトライ"
          >
            <RotateCcw size={8} />
            <span>RETRY</span>
          </button>

          {hero.status === 'walking' ? (
            <button
              onClick={onPauseWalking}
              className="retro-btn retro-btn-gold text-[8px] font-press font-bold py-0.5 px-2 cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Square size={8} fill="currentColor" />
              <span>PAUSE</span>
            </button>
          ) : (
            <button
              disabled={hero.status === 'victory' || hero.status === 'battling'}
              onClick={onStartWalking}
              className="retro-btn retro-btn-gold text-[8px] font-press font-bold py-0.5 px-2 cursor-pointer flex items-center gap-1 disabled:opacity-50 shrink-0"
            >
              <Play size={8} fill="currentColor" />
              <span>GUIDE</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
