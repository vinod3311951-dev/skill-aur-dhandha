import { COLORS, CORE_STAGE_COUNT, WORLDS, COLS } from "./config.js";
import { keyOf, neighbors } from "./grid.js";
import { seededRandom } from "./rng.js";

export function stageConfig(stageId) {
  if (!Number.isInteger(stageId) || stageId < 1 || stageId > CORE_STAGE_COUNT) {
    throw new RangeError(`stageId must be 1..${CORE_STAGE_COUNT}`);
  }
  const index = stageId - 1;
  const worldIndex = Math.floor(index / 20);
  const local = index % 20;
  const paletteSize = Math.min(6, 3 + Math.floor(index / 24));
  const filledRows = Math.min(8, 4 + Math.floor(local / 5));
  const shots = Math.max(18, 30 - Math.floor(index / 12));
  return {
    id: stageId,
    seed: `CD-V1-${stageId}`,
    worldIndex,
    world: WORLDS[worldIndex],
    palette: COLORS.slice(0, paletteSize),
    filledRows,
    shots
  };
}

export const STAGES = Array.from({ length: CORE_STAGE_COUNT }, (_, i) => stageConfig(i + 1));

export function generateBoard(config) {
  const rand = seededRandom(config.seed);
  const board = new Map();
  for (let row = 0; row < config.filledRows; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      if (row === config.filledRows - 1 && rand() < 0.28) continue;
      const color = config.palette[Math.floor(rand() * config.palette.length)];
      board.set(keyOf(row, col), color);
    }
  }
  const forced = config.palette[Math.floor(rand() * config.palette.length)];
  board.set(keyOf(0, 0), forced);
  board.set(keyOf(0, 1), forced);
  return board;
}

export function eligibleColors(board) {
  return [...new Set(board.values())];
}

export function chooseNextColor(board, seedToken) {
  const options = eligibleColors(board);
  if (!options.length) return null;
  const rand = seededRandom(seedToken);
  return options[Math.floor(rand() * options.length)];
}

export function hasPlayablePair(board) {
  for (const [key, color] of board) {
    const [r, c] = key.split(",").map(Number);
    if (neighbors(r, c).some(([nr, nc]) => board.get(keyOf(nr, nc)) === color)) return true;
  }
  return false;
}

export function validateBoard(board, config) {
  if (!(board instanceof Map)) return { ok: false, reason: "not-map" };
  if (board.size === 0) return { ok: false, reason: "empty-opening" };
  for (const color of board.values()) {
    if (!config.palette.includes(color)) return { ok: false, reason: "palette-violation" };
  }
  if (!hasPlayablePair(board)) return { ok: false, reason: "no-playable-pair" };
  const eligible = eligibleColors(board);
  if (!eligible.length) return { ok: false, reason: "no-eligible-color" };
  return { ok: true, eligible };
}