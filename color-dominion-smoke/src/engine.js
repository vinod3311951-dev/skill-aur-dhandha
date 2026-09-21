import { keyOf, fromKey, neighbors, cellCenter, nearestEmptyNeighbor } from "./grid.js";
import { chooseNextColor, eligibleColors } from "./stages.js";

export function sameColorGroup(board, startKey) {
  const color = board.get(startKey);
  if (!color) return new Set();
  const seen = new Set([startKey]);
  const queue = [startKey];
  while (queue.length) {
    const current = queue.shift();
    const [r, c] = fromKey(current);
    for (const [nr, nc] of neighbors(r, c)) {
      const k = keyOf(nr, nc);
      if (!seen.has(k) && board.get(k) === color) {
        seen.add(k);
        queue.push(k);
      }
    }
  }
  return seen;
}

export function ceilingConnected(board) {
  const seen = new Set();
  const queue = [];
  for (const key of board.keys()) {
    const [r] = fromKey(key);
    if (r === 0) {
      seen.add(key);
      queue.push(key);
    }
  }
  while (queue.length) {
    const current = queue.shift();
    const [r, c] = fromKey(current);
    for (const [nr, nc] of neighbors(r, c)) {
      const k = keyOf(nr, nc);
      if (board.has(k) && !seen.has(k)) {
        seen.add(k);
        queue.push(k);
      }
    }
  }
  return seen;
}

export function resolveAttach(board, attachKey) {
  const matched = sameColorGroup(board, attachKey);
  const removed = [];
  const dropped = [];
  if (matched.size >= 3) {
    for (const key of matched) {
      board.delete(key);
      removed.push(key);
    }
    const anchored = ceilingConnected(board);
    for (const key of [...board.keys()]) {
      if (!anchored.has(key)) {
        board.delete(key);
        dropped.push(key);
      }
    }
  }
  return { removed, dropped };
}

export class GameEngine {
  constructor({ board, config }) {
    this.board = new Map(board);
    this.config = config;
    this.shotsLeft = config.shots;
    this.score = 0;
    this.shotNumber = 0;
    this.status = "playing";
    this.projectile = null;
    this.nextColor = chooseNextColor(this.board, `${config.seed}-next-0`);
  }

  fire(origin, target, speed = 720) {
    if (this.status !== "playing" || this.projectile || !this.nextColor) return false;
    const dx = target.x - origin.x;
    const dy = Math.min(-24, target.y - origin.y);
    const len = Math.hypot(dx, dy) || 1;
    const nx = dx / len;
    const ny = dy / len;
    if (ny > -0.12) return false;
    this.projectile = {
      x: origin.x,
      y: origin.y,
      vx: nx * speed,
      vy: ny * speed,
      color: this.nextColor
    };
    return true;
  }

  update(dt, geometry) {
    if (!this.projectile || this.status !== "playing") return null;
    const p = this.projectile;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    const r = geometry.radius;
    const leftWall = geometry.left + r;
    const rightWall = geometry.left + geometry.boardWidth - r;
    if (p.x < leftWall) {
      p.x = leftWall + (leftWall - p.x);
      p.vx = Math.abs(p.vx);
    } else if (p.x > rightWall) {
      p.x = rightWall - (p.x - rightWall);
      p.vx = -Math.abs(p.vx);
    }

    let collisionKey = null;
    for (const key of this.board.keys()) {
      const [row, col] = fromKey(key);
      const c = cellCenter(row, col, geometry);
      if ((c.x - p.x) ** 2 + (c.y - p.y) ** 2 <= (r * 1.9) ** 2) {
        collisionKey = key;
        break;
      }
    }

    if (p.y <= geometry.top + r || collisionKey) {
      let targetCell = null;
      if (collisionKey) {
        const [r0, c0] = fromKey(collisionKey);
        targetCell = nearestEmptyNeighbor(this.board, r0, c0, p.x, p.y, geometry);
      } else {
        let bestCol = 0;
        let best = Infinity;
        for (let col = 0; col < geometry.cols; col += 1) {
          const c = cellCenter(0, col, geometry);
          const d = Math.abs(c.x - p.x);
          if (d < best) { best = d; bestCol = col; }
        }
        if (!this.board.has(keyOf(0, bestCol))) targetCell = [0, bestCol];
      }
      if (!targetCell) {
        this.projectile = null;
        return { type: "blocked" };
      }
      const attachKey = keyOf(targetCell[0], targetCell[1]);
      this.board.set(attachKey, p.color);
      this.projectile = null;
      this.shotsLeft -= 1;
      this.shotNumber += 1;
      const resolved = resolveAttach(this.board, attachKey);
      this.score += resolved.removed.length * 100 + resolved.dropped.length * 150;
      if (this.board.size === 0) this.status = "success";
      else if (this.shotsLeft <= 0) this.status = "failure";
      const options = eligibleColors(this.board);
      this.nextColor = options.length ? chooseNextColor(this.board, `${this.config.seed}-next-${this.shotNumber}`) : null;
      return { type: "attached", attachKey, ...resolved, status: this.status };
    }
    return null;
  }

  stars() {
    if (this.status !== "success") return 0;
    const ratio = this.shotsLeft / this.config.shots;
    if (ratio >= 0.5) return 3;
    if (ratio >= 0.25) return 2;
    return 1;
  }
}