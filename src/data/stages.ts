/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Stage } from '../types';

export const STAGES: Stage[] = [
  {
    id: 1,
    name: "旅立ちの草原 (Stage 1)",
    description: "冒険の基本。4x4の広々とした盤面にある「武器(鍛冶屋/宝箱)」マスを通って戦闘力を上げ、そのあと「魔物(スライム/ゴブリン)」を倒そう！すべての魔物を撃破すればステージクリア！",
    gridSize: 4,
    startCastleRow: 1, // Row 1 of 4
    initialHeroPower: 10,
    allowedSpecialties: [
      { type: 'forge', name: 'さびた鉄剣の研磨', value: 8, count: 1 },
      { type: 'chest', name: '初心者の宝箱', value: 12, count: 1 },
      { type: 'enemy', name: 'いたずらスライム', value: 11, count: 1 },
      { type: 'enemy', name: '見張りゴブリン', value: 25, count: 1 }
    ],
    panelInventory: {
      'h-straight': 4,
      'v-straight': 3,
      'curve-ne': 2,
      'curve-es': 2,
      'curve-sw': 2,
      'curve-wn': 2
    }
  },
  {
    id: 2,
    name: "毒沼の古代遺跡 (Stage 2)",
    description: "修行道場でお手軽に戦力【1.5倍】！しかし、新お邪魔ギミック「毒の沼地(減算デバフ)」が初登場。避けるか、それとも武器で打ち消して真っ直ぐ進むか、最適なルーティングを閃こう！",
    gridSize: 4,
    startCastleRow: 2, // Row 2 of 4
    initialHeroPower: 12,
    allowedSpecialties: [
      { type: 'forge', name: '魔鉄 of 鋼刃', value: 18, count: 1 },
      { type: 'dojo', name: '極限肉体修行', value: 1.5, count: 1 }, // value serves as multiplier
      { type: 'poison', name: 'ドロドロ毒の沼', value: -15, count: 1 }, // Flat subtraction de-buff
      { type: 'enemy', name: 'さまよう骸骨兵', value: 20, count: 1 },
      { type: 'enemy', name: '古代盾オーク', value: 42, count: 1 }
    ],
    panelInventory: {
      'h-straight': 3,
      'v-straight': 3,
      'curve-ne': 3,
      'curve-es': 2,
      'curve-sw': 2,
      'curve-wn': 2
    }
  },
  {
    id: 3,
    name: "溶岩の燃える毒谷 (Stage 3)",
    description: "広大になった5x5グリッド！神聖な泉(2.0倍倍率)が登場！ここでもお邪魔マス「毒の沼地」が配置。上手く回り道をしてゴーレム討伐の大いなる戦闘力を手に入れるんだ！",
    gridSize: 5,
    startCastleRow: 2,
    initialHeroPower: 15,
    allowedSpecialties: [
      { type: 'forge', name: '名剣ヴォルカヌス', value: 25, count: 1 },
      { type: 'shop', name: '賢者の増幅秘薬', value: 15, count: 1 },
      { type: 'fountain', name: '命の聖水泉', value: 2.0, count: 1 }, // 2x multiplier
      { type: 'chest', name: '炎の隠し財宝', value: 30, count: 1 },
      { type: 'poison', name: '熱り輝く毒沼', value: -30, count: 1 }, // Flat subtraction de-buff
      { type: 'enemy', name: 'ファイヤスライム', value: 22, count: 1 },
      { type: 'enemy', name: '火山ゴーレム', value: 75, count: 1 }
    ],
    panelInventory: {
      'h-straight': 5,
      'v-straight': 5,
      'curve-ne': 3,
      'curve-es': 3,
      'curve-sw': 3,
      'curve-wn': 3
    }
  },
  {
    id: 4,
    name: "神聖なる風化回廊 (Stage 4)",
    description: "伝説の聖剣エクスカリバーが眠る神界の回廊。毒の沼地のデバフ効果が【割合低下: POW×0.8】に凶悪化！踏む順番（聖泉の前に踏むか？）の工夫が明暗を分けるぞ！",
    gridSize: 5,
    startCastleRow: 2,
    initialHeroPower: 20,
    allowedSpecialties: [
      { type: 'forge', name: '聖剣エクスカリバー', value: 60, count: 1 },
      { type: 'shop', name: '神界のエリクサー', value: 40, count: 1 },
      { type: 'dojo', name: '英雄覇気の覚醒', value: 1.8, count: 1 },
      { type: 'poison', name: '侵食する空毒液', value: 0.8, count: 1 }, // Percentage multiplier de-buff (POW * 0.8)
      { type: 'enemy', name: '鉄翼グリフォン騎士', value: 50, count: 1 },
      { type: 'enemy', name: '暗黒アポストル', value: 130, count: 1 }
    ],
    panelInventory: {
      'h-straight': 6,
      'v-straight': 6,
      'curve-ne': 4,
      'curve-es': 4,
      'curve-sw': 4,
      'curve-wn': 4
    }
  },
  {
    id: 5,
    name: "魔王ルシファーの座 (Stage 5)",
    description: "無限の増幅源泉(2.0倍)、修行(2.5倍)、そして【割合毒沼(POW×0.75)】が混在する、究極の6x6パズル！前ステージから引き継いだインフレ戦闘力を解き放ち、魔王ルシファーを屠ろう！",
    gridSize: 6,
    startCastleRow: 3,
    initialHeroPower: 25,
    allowedSpecialties: [
      { type: 'forge', name: '神滅剣ラグナロク', value: 150, count: 1 },
      { type: 'shop', name: '奇跡 of 仙丹薬', value: 80, count: 1 },
      { type: 'fountain', name: '無限の増幅源泉', value: 2.0, count: 1 },
      { type: 'dojo', name: '超神魔合一修行', value: 2.5, count: 1 },
      { type: 'poison', name: '魔界呪の沼', value: 0.75, count: 2 }, // Percentage multiplier de-buff (POW * 0.75)
      { type: 'enemy', name: 'デスナイト将軍', value: 90, count: 1 },
      { type: 'enemy', name: '魔界邪皇帝ウロボロス', value: 220, count: 1 },
      { type: 'enemy', name: '究極魔王ルシファー', value: 500, count: 1 }
    ],
    panelInventory: {
      'h-straight': 8,
      'v-straight': 8,
      'curve-ne': 5,
      'curve-es': 5,
      'curve-sw': 5,
      'curve-wn': 5
    }
  }
];
