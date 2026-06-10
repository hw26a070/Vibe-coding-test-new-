/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { STAGES } from './data/stages';
import { Tile, PlayerHero, GameSettings } from './types';
import { 
  generateBoardTiles, 
  getTileExitDirection, 
  getOppositeDirection, 
  rotateConnections, 
  PATH_PATTERNS, 
  PathPattern 
} from './utils/boardGenerator';
import { soundEffects } from './utils/audio';

import { HeroDetails } from './components/HeroDetails';
import { GameBoard } from './components/GameBoard';
import { StageSelector } from './components/StageSelector';
import { PixelIcon } from './components/PixelIcons';

import { HelpCircle, Star, Sparkles, Lightbulb, RefreshCw, Layers, Swords, Castle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Get random road tile connections out of the 7 archetypes for Hand replenishment
const getRandomPathPattern = (): PathPattern => {
  return PATH_PATTERNS[Math.floor(Math.random() * PATH_PATTERNS.length)];
};

export default function App() {
  // 1. Stage States
  const [currentStageId, setCurrentStageId] = useState<number>(1);
  const activeStage = useMemo(() => {
    return STAGES.find(s => s.id === currentStageId) || STAGES[0];
  }, [currentStageId]);

  // Persistent Completed Stages checklist
  const [completedStages, setCompletedStages] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('path_hero_completed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Saving stage completions
  const markStageCompleted = (id: number) => {
    setCompletedStages(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem('path_hero_completed', JSON.stringify(next));
      return next;
    });
  };

  // 2. Play Board grid and Hero state
  const [tiles, setTiles] = useState<Tile[]>([]);
  
  // Hand deck of 4 road panels
  const [handTiles, setHandTiles] = useState<PathPattern[]>([]);
  const [selectedHandIndex, setSelectedHandIndex] = useState<number>(0);

  // General Hero Details
  const [hero, setHero] = useState<PlayerHero>({
    power: 10,
    maxPower: 10,
    level: 1,
    weapon: 'ひのきの棒',
    shield: '布の服',
    accessory: 'なし',
    status: 'idle',
    position: 'start',
    subPosition: 'exiting',
    entryDirection: null,
    exitDirection: 'E',
    pathHistory: []
  });

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    isMuted: false,
    gameSpeed: 1.5
  });

  // Battle and exploration output logs
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<{ id: string; text: string; row: number; col: number; colorClass: string }[]>([]);

  // Tutorial toggle
  const [isFirstTutorialOpen, setIsFirstTutorialOpen] = useState<boolean>(false);

  // App View switcher: 'stages' list selection screen OR 'game' play layout screen
  const [appView, setAppView] = useState<'stages' | 'game'>('stages');

  // Initialize Board and Hand states for Active Stage
  const initializeStage = (stageId: number) => {
    const stg = STAGES.find(s => s.id === stageId) || STAGES[0];
    const generated = generateBoardTiles(stg);
    setTiles(generated);
    
    // Scramble Hand Deck of 4 road options
    const initialHand = Array.from({ length: 4 }, () => getRandomPathPattern());
    setHandTiles(initialHand);
    setSelectedHandIndex(0);

    // Clear logs and float alerts
    setBattleLog([
      `[BATTLE] 【${stg.name}】へ進入しました！`,
      `[HERO] 勇者がスタートに転送されました。戦力を集めて、すべての指名手配魔物を討伐せよ！`
    ]);
    setFloatingTexts([]);

    // Set Hero back to Castle Docked position
    setHero({
      power: stg.initialHeroPower,
      maxPower: stg.initialHeroPower,
      level: 1,
      weapon: 'ひのきの棒',
      shield: '布の服',
      accessory: 'なし',
      status: 'idle',
      position: 'start',
      subPosition: 'exiting',
      entryDirection: null,
      exitDirection: 'E',
      pathHistory: []
    });
  };

  // Trigger stage change
  useEffect(() => {
    initializeStage(currentStageId);
  }, [currentStageId]);

  // Audio Toggle
  const handleToggleMute = () => {
    const nextMuted = !settings.isMuted;
    setSettings(prev => ({ ...prev, isMuted: nextMuted }));
    soundEffects.setMuted(nextMuted);
  };

  // Walking speed toggle scalar
  const handleSpeedChange = (speed: number) => {
    setSettings(prev => ({ ...prev, gameSpeed: speed }));
  };

  // Floating micro annotations above tile
  const addFloatingText = (text: string, row: number, col: number, colorClass = 'text-amber-400 border-amber-300') => {
    const id = `${Date.now()}_${Math.random()}`;
    setFloatingTexts(prev => [...prev, { id, text, row, col, colorClass }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 1200);
  };

  // Reset current walk run (teleports hero back to Castle with initial power and respawns defeated targets)
  const handleResetStage = () => {
    soundEffects.playSlide();
    
    // Set Hero stats back to start
    setHero({
      power: activeStage.initialHeroPower,
      maxPower: activeStage.initialHeroPower,
      level: 1,
      weapon: 'ひのきの棒',
      shield: '布の服',
      accessory: 'なし',
      status: 'idle',
      position: 'start',
      subPosition: 'exiting',
      entryDirection: null,
      exitDirection: 'E',
      pathHistory: []
    });

    // Reset visited status of ALL weapons and monsters so they are collectable/defeatable again
    setTiles(prev => prev.map(tile => ({ ...tile, specialtyVisited: false })));
    setBattleLog(prev => [
      `[RESET] 勇者が最初から（城門前）やり直します！`,
      `[BUILD] 盤面に置いた道路の設置状況はそのまま引き継がれます！`
    ]);
  };

  // Start walking walk track action
  const handleStartWalking = () => {
    soundEffects.playSlide();
    setHero(prev => ({
      ...prev,
      status: 'walking',
      // If completed or defeated, restart position from castle
      position: prev.status === 'defeated' || prev.status === 'victory' ? 'start' : prev.position,
      subPosition: prev.position === 'start' ? 'exiting' : prev.subPosition,
      exitDirection: prev.position === 'start' ? 'E' : prev.exitDirection
    }));
    setBattleLog(prev => [...prev, `[WALK] 勇者が出撃！リアルタイム歩行を開始します...`]);
  };

  // Suspend walkthrough loop
  const handlePauseWalking = () => {
    soundEffects.playSlide();
    setHero(prev => ({ ...prev, status: 'idle' }));
    setBattleLog(prev => [...prev, `[PAUSE] 勇者の歩行を一時停止しました。`]);
  };

  // Place selected hand tile into specified empty slot Cell
  const handlePlaceTile = (gridIndex: number) => {
    if (tiles[gridIndex].type !== 'empty') return; // Must be empty slot

    const chosenPattern = handTiles[selectedHandIndex];
    if (!chosenPattern) return;

    soundEffects.playSlide();

    // Spawn new road tile
    const newRoadTile: Tile = {
      id: `tile_${currentStageId}_placed_${Date.now()}_${Math.random()}`,
      type: 'road',
      connections: [...chosenPattern.connections],
      specialty: 'none',
      specialtyVisited: false,
      specialtyValue: 0,
      originalIndex: gridIndex
    };

    setTiles(prev => {
      const next = [...prev];
      next[gridIndex] = newRoadTile;
      return next;
    });

    // Replenish used hand slot with a brand new random pattern
    setHandTiles(prev => {
      const next = [...prev];
      next[selectedHandIndex] = getRandomPathPattern();
      return next;
    });

    // Write to tracker logs
    const row = Math.floor(gridIndex / activeStage.gridSize);
    const col = gridIndex % activeStage.gridSize;
    addFloatingText("PLACED! [IN]", row, col, "text-emerald-400 border-emerald-500 bg-obsidian-deep/90");
  };

  // Click standard placed tile to rotate its connections 90 degrees clockwise
  const handleRotateTile = (gridIndex: number) => {
    const tile = tiles[gridIndex];
    if (!tile || tile.type === 'empty' || tile.isStatic) return;

    // Do NOT let rotation happen if hero is standing on it!
    if (typeof hero.position === 'object') {
      const row = Math.floor(gridIndex / activeStage.gridSize);
      const col = gridIndex % activeStage.gridSize;
      if (hero.position.row === row && hero.position.col === col) {
        addFloatingText("ロック中 [LOCK]", row, col, "text-red-400 border-red-500 bg-red-950/25");
        soundEffects.playBlocked();
        return;
      }
    }

    soundEffects.playSlide();

    setTiles(prev => {
      const next = [...prev];
      next[gridIndex] = {
        ...next[gridIndex],
        connections: rotateConnections(next[gridIndex].connections)
      };
      return next;
    });

    const row = Math.floor(gridIndex / activeStage.gridSize);
    const col = gridIndex % activeStage.gridSize;
    addFloatingText("ROTATE [TURN]", row, col, "text-gold-accent border-gold-accent bg-obsidian-deep/90");
  };

  // Remove specific placed standard road tile to free up space
  const handleRemoveTile = (gridIndex: number) => {
    const tile = tiles[gridIndex];
    if (!tile || tile.type === 'empty' || tile.isStatic) return;

    // Do NOT allow deletion if hero is standing on it!
    if (typeof hero.position === 'object') {
      const row = Math.floor(gridIndex / activeStage.gridSize);
      const col = gridIndex % activeStage.gridSize;
      if (hero.position.row === row && hero.position.col === col) {
        addFloatingText("ロック中 [LOCK]", row, col, "text-red-400 border-red-500 bg-red-950/25");
        soundEffects.playBlocked();
        return;
      }
    }

    soundEffects.playSlide();

    setTiles(prev => {
      const next = [...prev];
      next[gridIndex] = {
        id: `tile_${currentStageId}_empty_${gridIndex}`,
        type: 'empty',
        connections: [],
        specialty: 'none',
        specialtyVisited: false,
        specialtyValue: 0,
        originalIndex: gridIndex
      };
      return next;
    });

    const row = Math.floor(gridIndex / activeStage.gridSize);
    const col = gridIndex % activeStage.gridSize;
    addFloatingText("REMOVE 🧹", row, col, "text-red-400 border-red-500 bg-red-950/20");
  };

  // ---------------------------------------------------------
  // REAL-TIME ROAD WALK ANIMATION TICKER
  // ---------------------------------------------------------
  useEffect(() => {
    if (hero.status !== 'walking') return;

    const ms = 750 / settings.gameSpeed; 
    const timer = setInterval(() => {
      setHero(currentHero => {
        
        // 1. Initial transition from START Castle off-grid into (startRow, col:0)
        if (currentHero.position === 'start') {
          const nextRow = activeStage.startCastleRow;
          const nextCol = 0;
          const targetTileIdx = nextRow * activeStage.gridSize + nextCol;
          const targetTile = tiles[targetTileIdx];

          if (targetTile && targetTile.type !== 'empty' && targetTile.connections.includes('W')) {
            soundEffects.playStep();
            return {
              ...currentHero,
              position: { row: nextRow, col: nextCol },
              subPosition: 'entering',
              entryDirection: 'W',
              exitDirection: null,
              pathHistory: []
            };
          } else {
            // Door closed or missing
            soundEffects.playBlocked();
            setBattleLog(prev => [...prev, `[WARN] 城門の東(W)に接続されている道路がありません！`]);
            return { ...currentHero, status: 'blocked' };
          }
        }

        // 2. Continuous index stepping inside grid cells
        if (typeof currentHero.position === 'object') {
          const { row, col } = currentHero.position;
          const currentTileIdx = row * activeStage.gridSize + col;
          const currentTile = tiles[currentTileIdx];

          if (!currentTile || currentTile.type === 'empty') {
            soundEffects.playDefeat();
            setBattleLog(prev => [...prev, `[WARN] 【空中落下】道路のない隙間へ落下しました！`]);
            
            // Timeout alert trigger and reset
            setTimeout(() => {
              handleResetStage();
            }, 50);

            return {
              ...currentHero,
              status: 'defeated',
              position: 'start',
              subPosition: 'exiting',
              entryDirection: null,
              exitDirection: 'E'
            };
          }

          // Sub-position A: Just entered the tile -> trigger buff pick or monster battle calculation
          if (currentHero.subPosition === 'entering') {
            const entryD = currentHero.entryDirection;
            if (!entryD || !currentTile.connections.includes(entryD)) {
              soundEffects.playBlocked();
              setBattleLog(prev => [...prev, `[WARN] 道路形状が合っておらず進入不可能です！`]);
              return { ...currentHero, status: 'blocked' };
            }

            let updatedPower = currentHero.power;
            let updatedLevel = currentHero.level;
            let logMsg = '';
            let colorTheme = 'text-green-400 border-green-500 bg-zinc-950/80';

            if (currentTile.specialty !== 'none' && !currentTile.specialtyVisited) {
              const specVal = currentTile.specialtyValue;
              const specName = currentTile.specialtyName || '謎の秘宝';

              if (currentTile.specialty === 'enemy') {
                // Battle comparison logic!
                if (updatedPower >= specVal) {
                  // Win! Defeated the monster!
                  updatedPower += specVal;
                  updatedLevel += 1;
                  logMsg = `撃破! +${specVal}`;
                  colorTheme = 'text-emerald-400 border-emerald-300 bg-emerald-900/10 border-emerald-500/20';
                  soundEffects.playPowerUp();

                  // Write encounter win log
                  setBattleLog(prev => [
                    ...prev,
                    `[WIN] 【戦闘勝利!】${specName} (POW: ${specVal}) と力比べ！ [POW] ${currentHero.power} ≧ [POW] ${specVal} で完全勝利！魔力を吸収して戦闘力が +${specVal} 上昇！（現在：[POW] ${updatedPower}）`
                  ]);

                  // Mark this specific cell as visited
                  setTiles(prevBoard => {
                    const nextBoard = [...prevBoard];
                    nextBoard[currentTileIdx] = {
                      ...nextBoard[currentTileIdx],
                      specialtyVisited: true
                    };
                    
                    // Immediately check if all monster cells isStatic are now defeated
                    const remainingUndefeatedEnemies = nextBoard.filter(t => t.specialty === 'enemy' && !t.specialtyVisited).length;
                    if (remainingUndefeatedEnemies === 0) {
                      soundEffects.playVictory();
                      setBattleLog(p => [
                        ...p,
                        `=== 【ステージクリア！！】 ===`,
                        `盤面上の全指名手配魔物をすべて討伐完了しました！素晴らしい頭脳プレイです！`
                      ]);
                      markStageCompleted(currentStageId);
                      setHero(h => ({ ...h, status: 'victory' }));
                      setTimeout(() => {
                        alert(`[SUCCESS] ステージクリア！！\n【${activeStage.name}】のすべてのモンスターを倒し、完全制覇を達成しました！`);
                      }, 200);
                    }

                    return nextBoard;
                  });

                  // Return center transition
                  return {
                    ...currentHero,
                    power: updatedPower,
                    level: updatedLevel,
                    subPosition: 'center'
                  };

                } else {
                  // Lost! Defeated by monster!
                  soundEffects.playDefeat();
                  setBattleLog(prev => [
                    ...prev,
                    `[FAIL] 【戦闘敗北...】${specName} (POW: ${specVal}) に遭遇！ [POW] ${currentHero.power} ＜ [POW] ${specVal} のため、数の勝負に勝てませんでした。`
                  ]);
                  
                  setTimeout(() => {
                    alert(`[RETRY] 魔物との力比べに敗れました！\n【${specName}】は戦闘力 [POW: ${specVal}] の強敵です。先に鍛冶屋ハンマーや修行マスを通過して、戦闘力を高めてから挑戦しましょう！`);
                    handleResetStage();
                  }, 100);

                  return {
                    ...currentHero,
                    status: 'defeated',
                    position: 'start',
                    subPosition: 'exiting',
                    entryDirection: null,
                    exitDirection: 'E'
                  };
                }
              } else {
                // Additive Boost Weapons (Forge, Shop, Chest) or Multiplier (Dojo, Fountain)
                setTiles(prevBoard => {
                  const nextBoard = [...prevBoard];
                  nextBoard[currentTileIdx] = {
                    ...nextBoard[currentTileIdx],
                    specialtyVisited: true
                  };
                  return nextBoard;
                });

                if (currentTile.specialty === 'dojo' || currentTile.specialty === 'fountain') {
                  // Multipliers
                  updatedPower = Math.round(updatedPower * specVal);
                  updatedLevel += 1;
                  logMsg = `増幅! x${specVal}`;
                  colorTheme = 'text-cyan-400 border-cyan-300 bg-cyan-950/20 border-cyan-500/10';
                  soundEffects.playPowerUp();
                  setBattleLog(prev => [
                    ...prev,
                    `[BUFF] 【能力増幅】${specName} を通過！戦闘力が ${specVal}倍 (x${specVal}) へ一気に膨れ上がりました！（現在：[POW] ${updatedPower}）`
                  ]);
                } else {
                  // Additive
                  updatedPower += specVal;
                  updatedLevel += 1;
                  logMsg = `獲得! +${specVal}`;
                  colorTheme = 'text-yellow-400 border-yellow-300 bg-yellow-950/10 border-yellow-500/15';
                  soundEffects.playItem();
                  setBattleLog(prev => [
                    ...prev,
                    `[FORGE] 【武器獲得】${specName} を通過！攻撃力を吸収して 戦闘力 +${specVal} アップ！（現在：[POW] ${updatedPower}）`
                  ]);
                }

                addFloatingText(logMsg, row, col, colorTheme);
              }
            } else {
              // Plain physical step
              soundEffects.playStep();
            }

            return {
              ...currentHero,
              power: updatedPower,
              level: updatedLevel,
              subPosition: 'center'
            };
          }

          // Sub-position B: At center of currently stepped slot -> compute next target direction
          if (currentHero.subPosition === 'center') {
            const entryD = currentHero.entryDirection;
            const exitD = getTileExitDirection(currentTile, entryD!);

            if (exitD) {
              return {
                ...currentHero,
                subPosition: 'exiting',
                exitDirection: exitD
              };
            } else {
              soundEffects.playBlocked();
              setBattleLog(prev => [...prev, `[WARN] 行き止まりです！道の接続先（出入り口）が繋がっていません。`]);
              return { ...currentHero, status: 'blocked' };
            }
          }

          // Sub-position C: Leaving toward target exit Direction
          if (currentHero.subPosition === 'exiting') {
            const exitD = currentHero.exitDirection;
            if (!exitD) return currentHero;

            // Compute adjacent slots
            let nextRow = row;
            let nextCol = col;

            if (exitD === 'N') nextRow -= 1;
            if (exitD === 'S') nextRow += 1;
            if (exitD === 'E') nextCol += 1;
            if (exitD === 'W') nextCol -= 1;

            // Out of bounds check (walked off the grid edge)
            if (nextRow < 0 || nextRow >= activeStage.gridSize || nextCol < 0 || nextCol >= activeStage.gridSize) {
              soundEffects.playDefeat();
              setBattleLog(prev => [...prev, `[WARN] 【落下】道を踏み外し空中へ転落しました！`]);
              
              setTimeout(() => {
                handleResetStage();
              }, 50);

              return {
                ...currentHero,
                status: 'defeated',
                position: 'start',
                subPosition: 'exiting',
                entryDirection: null,
                exitDirection: 'E'
              };
            }

            // Link matching port check
            const nextTileIdx = nextRow * activeStage.gridSize + nextCol;
            const nextTile = tiles[nextTileIdx];
            const neededEntry = getOppositeDirection(exitD);

            if (nextTile && nextTile.type !== 'empty' && nextTile.connections.includes(neededEntry)) {
              return {
                ...currentHero,
                position: { row: nextRow, col: nextCol },
                subPosition: 'entering',
                entryDirection: neededEntry,
                exitDirection: null,
                pathHistory: [...currentHero.pathHistory, { row, col }]
              };
            } else {
              // Path disconnected ahead
              soundEffects.playBlocked();
              setBattleLog(prev => [...prev, `[WARN] 新しいマス(${nextRow}, ${nextCol})へ通じる道が繋がっていません！`]);
              return { ...currentHero, status: 'blocked' };
            }
          }
        }

        return currentHero;
      });
    }, ms);

    return () => clearInterval(timer);
  }, [hero.status, tiles, settings.gameSpeed, activeStage]);

  // Fast getter of active connection list of the selected hand tile
  const activeHandConnections = useMemo(() => {
    return handTiles[selectedHandIndex]?.connections || null;
  }, [handTiles, selectedHandIndex]);

  return (
    <div className="min-h-screen bg-black text-[#e0e0e0] flex flex-col font-sans select-none pb-2">
      
      {/* BRAND HEADER */}
      <header className="bg-neutral-950 border-b-4 border-solid border-white py-1.5 px-4 sm:px-6 relative overflow-hidden shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 relative z-10">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="bg-[#ffb800] text-[#000000] text-[7px] font-bold px-1.5 py-0.5 tracking-widest uppercase font-press">
                ACTIVE PATH BUILDING
              </span>
              <span className="text-[7px] text-zinc-500 font-press tracking-widest uppercase">8-BIT SYSTEM</span>
            </div>
            <h1 className="text-xs sm:text-sm font-bold text-[#ffb800] mt-0.5 flex flex-wrap items-center gap-1.5 font-press">
              <span className="flex items-center gap-1.5"><Castle size={14} className="text-[#ffb800]" /> ロードガイド勇者</span>
              <span className="text-zinc-500 text-[8.5px] font-bold leading-normal font-mono">〜 一画面パネル道繋ぎRPG 〜</span>
            </h1>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {appView === 'game' && (
              <button
                onClick={() => {
                  setAppView('stages');
                  soundEffects.playSlide();
                }}
                className="retro-btn border-[#ffb800] text-[#ffb800] text-[8px] py-0.5 px-2 flex items-center gap-1 cursor-pointer font-press font-bold"
              >
                <span>◀ STAGE SELECT</span>
              </button>
            )}

            <button
              onClick={() => setIsFirstTutorialOpen(true)}
              className="retro-btn text-[8px] py-0.5 px-2 flex items-center gap-1 cursor-pointer font-press font-bold"
            >
              <HelpCircle size={9} className="text-[#ffb800]" />
              <span>HOW TO PLAY</span>
            </button>
            
            <button
              onClick={() => {
                if (confirm("ゲームデータを完全に消去して最初からリスタートしますか？")) {
                  localStorage.removeItem('path_hero_completed');
                  setCompletedStages([]);
                  setCurrentStageId(1);
                  setAppView('stages');
                  soundEffects.playVictory();
                }
              }}
              className="retro-btn border-red-500 text-red-500 text-[8px] py-0.5 px-1.5 flex items-center justify-center cursor-pointer font-press"
              title="データを消去してリスタート"
            >
              <span>RESET</span>
            </button>
          </div>
        </div>
      </header>

      {/* CORE FRAMEWORK CONTAINER */}
      <main className="max-w-4xl mx-auto w-full px-2 sm:px-4 mt-2 flex-1 flex flex-col justify-center">
        
        {/* VIEW 1: STAGE SELECT SCREEN */}
        {appView === 'stages' ? (
          <div className="w-full flex-1 flex flex-col justify-center py-2 animate-fade-in">
            <StageSelector
              stages={STAGES}
              currentStageId={currentStageId}
              completedStages={completedStages}
              onSelectStage={(id) => {
                setCurrentStageId(id);
                setAppView('game');
                soundEffects.playSlide();
              }}
            />
            
            <div className="text-center mt-4">
              <button
                onClick={() => setIsFirstTutorialOpen(true)}
                className="retro-btn border-dashed text-[8.5px] py-2 px-4 font-press font-bold hover:bg-neutral-900"
              >
                💡 初めてプレイする方はこちら (HOW TO PLAY)
              </button>
            </div>
          </div>
        ) : (
          /* VIEW 2: FULLY INTERACTIVE COMPACT GAMEPLAY SCREEN (NON-SCROLLABLE) */
          <div className="w-full flex flex-col gap-2.5 max-w-2xl mx-auto animate-fade-in">
            
            {/* Quick Breadcrumb Info Header */}
            <div className="flex justify-between items-center px-1.5">
              <span className="text-[8.5px] font-bold text-zinc-400 font-press flex items-center gap-1">
                <Layers size={10} className="text-[#ffb800]" />
                STAGE {activeStage.id}: <span className="text-white">[{activeStage.name}]</span>
              </span>

              <button
                onClick={() => {
                  setAppView('stages');
                  soundEffects.playSlide();
                }}
                className="text-[7.5px] text-[#ffb800] hover:underline font-press bg-black px-1.5 py-0.5 border border-zinc-800"
              >
                ◀ BACK TO LEVELS
              </button>
            </div>

            {/* Real-time stats display panel (Compressed HUD) */}
            <HeroDetails
              hero={hero}
              settings={settings}
              onToggleMute={handleToggleMute}
              onSpeedChange={handleSpeedChange}
              onResetHero={handleResetStage}
              onStartWalking={handleStartWalking}
              onPauseWalking={handlePauseWalking}
            />

            {/* Path Grid Canvas */}
            <div className="flex flex-col gap-1.5">
              <GameBoard
                tiles={tiles}
                gridSize={activeStage.gridSize}
                hero={hero}
                startCastleRow={activeStage.startCastleRow}
                onPlaceTile={handlePlaceTile}
                onRotateTile={handleRotateTile}
                onRemoveTile={handleRemoveTile}
                floatingTexts={floatingTexts}
                activeHandTileConnections={activeHandConnections}
              />
            </div>

            {/* HAND OF ROAD TILES DECK */}
            <div id="path-pieces-hand" className="nes-panel p-2 text-[#e0e0e0] flex flex-col gap-1.5">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[6.5px] bg-[#ffb800] text-black px-1.5 py-0.5 font-press font-extrabold">HAND</span>
                  <span className="font-press font-bold text-[8px] text-[#ffb800] flex items-center gap-1">
                    <span>置きたい道をクリック ⇒ 盤面をタップ (もう一度クリックで手札回転)</span>
                  </span>
                </div>
                <span className="text-[7px] text-zinc-500 font-press">DECK</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {handTiles.map((pattern, idx) => {
                  const isSelected = selectedHandIndex === idx;
                  
                  return (
                    <motion.div
                      key={`hand-${idx}-${pattern.id}-${currentStageId}`}
                      onClick={() => {
                        if (isSelected) {
                          // Rotate card connections within our hand immediately!
                          setHandTiles(prev => {
                            const next = [...prev];
                            next[idx] = {
                              ...next[idx],
                              connections: rotateConnections(next[idx].connections),
                              label: next[idx].label.includes('[TURN]') ? next[idx].label : `${next[idx].label} [TURN]`
                            };
                            return next;
                          });
                          soundEffects.playSlide();
                        } else {
                          setSelectedHandIndex(idx);
                          soundEffects.playStep();
                        }
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-1 rounded-none border transition-all bg-black min-h-[56px] flex items-center justify-between gap-1.5 ${
                        isSelected 
                          ? 'border-[#ffb800] ring-1 ring-white bg-[#0a0701]' 
                          : 'border-zinc-800 hover:border-zinc-550'
                      }`}
                    >
                      {/* Miniature SVG Representation */}
                      <div className="relative w-8 h-8 border border-zinc-800 bg-black overflow-hidden shrink-0">
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                          {pattern.connections.map((dir, sIdx) => {
                            let pathD = '';
                            if (dir === 'N') pathD = 'M 50,0 L 50,50';
                            if (dir === 'S') pathD = 'M 50,50 L 50,100';
                            if (dir === 'E') pathD = 'M 50,50 L 100,50';
                            if (dir === 'W') pathD = 'M 0,50 L 50,50';
                            return (
                              <path
                                key={`mini-${dir}-${sIdx}`}
                                d={pathD}
                                stroke={isSelected ? "#ffb800" : "#444"}
                                strokeWidth="28"
                                strokeLinecap="square"
                              />
                            );
                          })}
                          {pattern.connections.map((dir, sIdx) => {
                            let pathD = '';
                            if (dir === 'N') pathD = 'M 50,0 L 50,50';
                            if (dir === 'S') pathD = 'M 50,50 L 50,100';
                            if (dir === 'E') pathD = 'M 50,50 L 100,50';
                            if (dir === 'W') pathD = 'M 0,50 L 50,50';
                            return (
                              <path
                                key={`mini-p-${dir}-${sIdx}`}
                                d={pathD}
                                stroke={isSelected ? "#ffffff" : "#777"}
                                strokeWidth="8"
                                strokeLinecap="square"
                              />
                            );
                          })}
                          {pattern.connections.length > 0 && (
                            <rect x="42" y="42" width="16" height="16" fill={isSelected ? "#ffb800" : "#111"} stroke="#000" strokeWidth="2" />
                          )}
                        </svg>
                      </div>

                      <div className="flex flex-col text-left justify-center flex-1 min-w-0 pr-1">
                        <span className="text-[7.5px] font-mono font-bold text-gray-300 truncate tracking-tighter">
                          {pattern.label.replace(' Connection', '')}
                        </span>
                        <span className="text-[6.5px] font-mono text-zinc-500 tracking-tighter">
                          [{pattern.connections.join('')}]
                        </span>
                      </div>

                      {isSelected && (
                        <span className="absolute -top-1.5 -right-0.5 text-[5px] text-black font-press bg-[#ffb800] px-1 py-0.5 border border-white font-bold uppercase whitespace-nowrap">
                          HOLD
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* FIXED FLOATING RETRO MODAL OVERLAY FOR HOW TO PLAY */}
      <AnimatePresence>
        {isFirstTutorialOpen && (
          <div 
            className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-fade-in"
            onClick={() => setIsFirstTutorialOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="nes-panel bg-neutral-950 border-4 border-white p-5 max-w-lg w-full text-sm flex flex-col gap-4 relative shadow-2xl"
            >
              {/* Header */}
              <div className="border-b-4 border-double border-white pb-2 flex justify-between items-center">
                <h4 className="font-bold text-[#ffb800] text-xs sm:text-sm tracking-wider font-press flex items-center gap-1.5">
                  <Lightbulb size={16} className="text-[#ffb800] animate-pulse" />
                  <span>HOW TO PLAY (遊び方)</span>
                </h4>
                <button 
                  onClick={() => {
                    setIsFirstTutorialOpen(false);
                    soundEffects.playSlide();
                  }}
                  className="text-[10px] text-zinc-500 font-press hover:text-white cursor-pointer"
                >
                  [X]
                </button>
              </div>

              {/* Instructions content */}
              <div className="text-zinc-300 text-xs leading-relaxed font-mono flex flex-col gap-2.5">
                <p>
                  盤面上のすべての<strong>「指名手配モンスター」</strong>を討伐すればステージクリアです！
                </p>
                
                <div className="bg-black/55 border border-zinc-800 p-3 flex flex-col gap-2 rounded-none">
                  <div>
                    <strong className="text-white">① パネルを置く:</strong><br />
                    手札(HAND)からパーツを選択し、盤面の<strong>暗黒の空きマス</strong>をタップして道を作ります。
                  </div>
                  <div>
                    <strong className="text-white">② 回転と撤去:</strong><br />
                    置いたパネルは、再度タップすることで<strong>90度右回転</strong>、またはホバー時のゴミ箱マークで<strong>撤去</strong>できます。手札そのものもダブルタップで事前回転が可能です。
                  </div>
                  <div>
                    <strong className="text-white">③ 修行と鍛錬で戦闘力を高める:</strong><br />
                    鍛冶屋<strong className="text-amber-400 font-bold">[+鍛冶屋]</strong>、修練所<strong className="text-emerald-400 font-bold">[x道場]</strong>などのマスの道を通ることで、勇者の戦闘力が上昇します。
                  </div>
                  <div>
                    <strong className="text-red-400">④ モンスター討伐:</strong><br />
                    勇者の戦闘力「POW」が、指名手配魔物<strong className="text-red-400">[P魔物力]</strong>の値を上回る状態で接触すると撃破でき、敗北するとリトライになります。
                  </div>
                  <div>
                    <strong className="text-white">⑤ 出撃案内:</strong><br />
                    道が繋がったら<strong>「GUIDE」</strong>を押すと、勇者が自動的に歩行・交戦を開始します。
                  </div>
                </div>

                <div className="text-[#ffb800] text-[8.5px] font-press bg-amber-955/20 p-2.5 border border-dashed border-[#ffb800] leading-normal uppercase">
                  ※ 注意: 勇者の現在いる場所は<strong>自動ロック🔒</strong>されます。進行中のパネルの回転・撤去はできません！
                </div>
              </div>

              {/* Close action button */}
              <div className="flex justify-end mt-1">
                <button
                  onClick={() => {
                    setIsFirstTutorialOpen(false);
                    soundEffects.playVictory();
                  }}
                  className="retro-btn retro-btn-gold text-[9px] px-4 py-2 cursor-pointer font-press font-bold"
                >
                  閉じる [UNDERSTOOD]
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER GENERAL INFO */}
      {appView === 'stages' && (
        <footer className="max-w-7xl mx-auto px-4 mt-4 border-t-2 border-solid border-zinc-800 pt-2 text-center text-[7px] text-zinc-500 font-press tracking-widest uppercase shrink-0">
          <div>Road Guide Hero — Active Grid Track Builder & Combat Comparison RPG</div>
          <div className="mt-0.5 text-[8px] text-[#52525a] font-mono normal-case">
            © Google coding challenge model. Flat 8-bit sound synth. No-telemetry workspace.
          </div>
        </footer>
      )}
    </div>
  );
}
