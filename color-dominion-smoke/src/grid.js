import { COLS, ROWS } from "./config.js";

export const keyOf = (row, col) => `${row},${col}`;
export const fromKey = (key) => key.split(",").map(Number);

export function inBounds(row, col, rows = ROWS, cols = COLS) {
  return row >= 0 && row < rows && col >= 0 && col < cols;
}

export function neighbors(row, col, rows = ROWS, cols = COLS) {
  const odd = row % 2 === 1;
  const deltas = odd
    ? [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]]
    : [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]];
  return deltas
    .map(([dr, dc]) => [row + dr, col + dc])
    .filter(([r, c]) => inBounds(r, c, rows, cols));
}

export function cellCenter(row, col, geometry) {
  const { radius, left, top, rowStep } = geometry;
  return {
    x: left + radius + col * radius * 2 + (row % 2 ? radius : 0),
    y: top + radius + row * rowStep
  };
}

export function nearestCell(x, y, geometry, rows = ROWS, cols = COLS) {
  let best = null;
  let bestD = Infinity;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const p = cellCenter(row, col, geometry);
      const d = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = [row, col];
      }
    }
  }
  return best;
}

export function nearestEmptyNeighbor(board, row, col, x, y, geometry, rows = ROWS, cols = COLS) {
  const candidates = [[row, col], ...neighbors(row, col, rows, cols)]
    .filter(([r, c]) => !board.has(keyOf(r, c)));
  if (!candidates.length) return null;
  candidates.sort((a, b) => {
    const pa = cellCenter(a[0], a[1], geometry);
    const pb = cellCenter(b[0], b[1], geometry);
    return ((pa.x - x) ** 2 + (pa.y - y) ** 2) - ((pb.x - x) ** 2 + (pb.y - y) ** 2);
  });
  return candidates[0];
}