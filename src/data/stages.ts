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
    ]
  },
  {
    id: 2,
    name: "修練の古代遺跡 (Stage 2)",
    description: "修行道場が登場！肉体修行を通ると戦力は【1.5倍】に跳ね上がる！広い4x4盤面で、強力な武器を拾ってから、修行に挑み、最凶のオークを撃破せよ！",
    gridSize: 4,
    startCastleRow: 2, // Row 2 of 4
    initialHeroPower: 12,
    allowedSpecialties: [
      { type: 'forge', name: '魔鉄 of 鋼刃', value: 18, count: 1 },
      { type: 'dojo', name: '極限肉体修行', value: 1.5, count: 1 }, // value serves as multiplier
      { type: 'enemy', name: 'さまよう骸骨兵', value: 20, count: 1 },
      { type: 'enemy', name: '古代盾オーク', value: 42, count: 1 }
    ]
  },
  {
    id: 3,
    name: "溶岩の燃える谷 (Stage 3)",
    description: "広大になった5x5グリッド！炎の魔物や強固なストーンゴーレムが牙を剥く。神聖な泉も駆使して大幅にパワーを溜めよう！",
    gridSize: 5,
    startCastleRow: 2,
    initialHeroPower: 15,
    allowedSpecialties: [
      { type: 'forge', name: '名剣ヴォルカヌス', value: 25, count: 1 },
      { type: 'shop', name: '賢者の増幅秘薬', value: 15, count: 1 },
      { type: 'fountain', name: '命の聖水泉', value: 2.0, count: 1 }, // 2x multiplier
      { type: 'chest', name: '炎の隠し財宝', value: 30, count: 1 },
      { type: 'enemy', name: 'ファイヤスライム', value: 22, count: 1 },
      { type: 'enemy', name: '火山ゴーレム', value: 75, count: 1 }
    ]
  },
  {
    id: 4,
    name: "神聖なる空中回廊 (Stage 4)",
    description: "伝説の聖剣エクスカリバーが眠る神界の回廊。5x5にパワーアップ！超強力なグリフォン騎士とダークアポストルを討ち取れ！",
    gridSize: 5,
    startCastleRow: 2,
    initialHeroPower: 20,
    allowedSpecialties: [
      { type: 'forge', name: '聖剣エクスカリバー', value: 60, count: 1 },
      { type: 'shop', name: '神界のエリクサー', value: 40, count: 1 },
      { type: 'dojo', name: '英雄覇気の覚醒', value: 1.8, count: 1 },
      { type: 'enemy', name: '鉄翼グリフォン騎士', value: 50, count: 1 },
      { type: 'enemy', name: '暗黒アポストル', value: 130, count: 1 }
    ]
  },
  {
    id: 5,
    name: "魔王ルシファーの座 (Stage 5)",
    description: "究極の6x6の超特大ステージ！最強の武器、増幅薬、修行のパーフェクト・ルートを構築せよ！すべての覇王、そして「魔王ルシファー」をねじ伏せろ！",
    gridSize: 6,
    startCastleRow: 3,
    initialHeroPower: 25,
    allowedSpecialties: [
      { type: 'forge', name: '神滅剣ラグナロク', value: 150, count: 1 },
      { type: 'shop', name: '奇跡の仙丹薬', value: 80, count: 1 },
      { type: 'fountain', name: '無限の増幅源泉', value: 2.0, count: 1 },
      { type: 'dojo', name: '超神魔合一修行', value: 2.5, count: 1 },
      { type: 'enemy', name: 'デスナイト将軍', value: 90, count: 1 },
      { type: 'enemy', name: '魔界邪皇帝ウロボロス', value: 220, count: 1 },
      { type: 'enemy', name: '究極魔王ルシファー', value: 500, count: 1 }
    ]
  }
];
