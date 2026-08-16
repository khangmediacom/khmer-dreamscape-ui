/**
 * Ouk Chatrang (Khmer chess) rules engine.
 *
 * Pieces:
 *  - k  Sdech (King)   : one square any direction
 *  - q  Neang (Queen)  : one square diagonally; may leap two squares forward on its first move
 *  - b  Koul (Elephant): one square diagonally, or one square straight forward
 *  - n  Ses  (Horse)   : knight leaps
 *  - r  Touk (Boat)    : slides orthogonally
 *  - p  Trey (Fish)    : one square forward, captures diagonally forward, promotes to Neang on rank 6
 */

export type Color = "w" | "b";
export type PieceType = "k" | "q" | "b" | "n" | "r" | "p";
export type Piece = { type: PieceType; color: Color; moved?: boolean };
export type Square = Piece | null;
export type Board = Square[]; // 64, index 0 = a8 ... 63 = h1

export type Move = {
  from: number;
  to: number;
  captured?: Piece | null;
  promotion?: boolean;
};

export const PIECE_NAMES: Record<PieceType, { km: string; en: string; value: number }> = {
  k: { km: "Sdech", en: "King", value: 0 },
  q: { km: "Neang", en: "Queen", value: 3 },
  b: { km: "Koul", en: "Elephant", value: 3 },
  n: { km: "Ses", en: "Horse", value: 4 },
  r: { km: "Touk", en: "Boat", value: 8 },
  p: { km: "Trey", en: "Fish", value: 1 },
};

export const GLYPHS: Record<PieceType, string> = {
  k: "♚",
  q: "♛",
  b: "♝",
  n: "♞",
  r: "♜",
  p: "♟",
};

const row = (i: number) => Math.floor(i / 8);
const col = (i: number) => i % 8;
const inside = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;
const idx = (r: number, c: number) => r * 8 + c;

export function initialBoard(): Board {
  const b: Board = Array.from({ length: 64 }, () => null);
  const back: PieceType[] = ["r", "n", "b", "k", "q", "b", "n", "r"];
  back.forEach((t, c) => {
    b[idx(0, c)] = { type: t === "k" ? "q" : t === "q" ? "k" : t, color: "b" };
    b[idx(7, c)] = { type: t, color: "w" };
  });
  for (let c = 0; c < 8; c++) {
    b[idx(2, c)] = { type: "p", color: "b" };
    b[idx(5, c)] = { type: "p", color: "w" };
  }
  return b;
}

export function squareName(i: number) {
  return "abcdefgh"[col(i)] + (8 - row(i));
}

function pseudoMoves(board: Board, from: number): number[] {
  const p = board[from];
  if (!p) return [];
  const r = row(from);
  const c = col(from);
  const out: number[] = [];
  const forward = p.color === "w" ? -1 : 1;
  const empty = (i: number) => board[i] === null;
  const enemy = (i: number) => board[i] !== null && board[i]!.color !== p.color;
  const push = (rr: number, cc: number) => {
    if (!inside(rr, cc)) return;
    const i = idx(rr, cc);
    if (empty(i) || enemy(i)) out.push(i);
  };

  switch (p.type) {
    case "k":
      for (const dr of [-1, 0, 1])
        for (const dc of [-1, 0, 1]) if (dr || dc) push(r + dr, c + dc);
      break;
    case "q":
      for (const dr of [-1, 1]) for (const dc of [-1, 1]) push(r + dr, c + dc);
      if (!p.moved) {
        const one = idx(r + forward, c);
        const two = inside(r + forward * 2, c) ? idx(r + forward * 2, c) : -1;
        if (inside(r + forward * 2, c) && empty(one) && (empty(two) || enemy(two))) out.push(two);
      }
      break;
    case "b":
      for (const dr of [-1, 1]) for (const dc of [-1, 1]) push(r + dr, c + dc);
      push(r + forward, c);
      break;
    case "n":
      for (const [dr, dc] of [
        [1, 2],
        [2, 1],
        [-1, 2],
        [-2, 1],
        [1, -2],
        [2, -1],
        [-1, -2],
        [-2, -1],
      ])
        push(r + dr, c + dc);
      break;
    case "r":
      for (const [dr, dc] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        let rr = r + dr;
        let cc = c + dc;
        while (inside(rr, cc)) {
          const i = idx(rr, cc);
          if (empty(i)) out.push(i);
          else {
            if (enemy(i)) out.push(i);
            break;
          }
          rr += dr;
          cc += dc;
        }
      }
      break;
    case "p": {
      if (inside(r + forward, c) && empty(idx(r + forward, c))) out.push(idx(r + forward, c));
      for (const dc of [-1, 1]) {
        if (inside(r + forward, c + dc)) {
          const i = idx(r + forward, c + dc);
          if (enemy(i)) out.push(i);
        }
      }
      break;
    }
  }
  return out;
}

export function findKing(board: Board, color: Color) {
  return board.findIndex((s) => s && s.type === "k" && s.color === color);
}

export function isAttacked(board: Board, target: number, by: Color) {
  for (let i = 0; i < 64; i++) {
    const p = board[i];
    if (p && p.color === by && pseudoMoves(board, i).includes(target)) return true;
  }
  return false;
}

export function inCheck(board: Board, color: Color) {
  const k = findKing(board, color);
  if (k < 0) return false;
  return isAttacked(board, k, color === "w" ? "b" : "w");
}

export function applyMove(board: Board, from: number, to: number): Board {
  const next = board.slice();
  const p = next[from]!;
  const promoRank = p.color === "w" ? 2 : 5;
  next[from] = null;
  next[to] =
    p.type === "p" && row(to) === promoRank
      ? { type: "q", color: p.color, moved: true }
      : { ...p, moved: true };
  return next;
}

export function legalMoves(board: Board, from: number): number[] {
  const p = board[from];
  if (!p) return [];
  return pseudoMoves(board, from).filter((to) => !inCheck(applyMove(board, from, to), p.color));
}

export function allLegalMoves(board: Board, color: Color): { from: number; to: number }[] {
  const moves: { from: number; to: number }[] = [];
  for (let i = 0; i < 64; i++) {
    const p = board[i];
    if (p && p.color === color) for (const to of legalMoves(board, i)) moves.push({ from: i, to });
  }
  return moves;
}

export type Status = "playing" | "check" | "checkmate" | "stalemate";

export function status(board: Board, turn: Color): Status {
  const moves = allLegalMoves(board, turn);
  const check = inCheck(board, turn);
  if (moves.length === 0) return check ? "checkmate" : "stalemate";
  return check ? "check" : "playing";
}

function evaluate(board: Board, color: Color) {
  let score = 0;
  for (let i = 0; i < 64; i++) {
    const p = board[i];
    if (!p) continue;
    const v = PIECE_NAMES[p.type].value * 10 + (p.type === "p" ? (p.color === "w" ? 7 - row(i) : row(i)) : 0);
    score += p.color === color ? v : -v;
  }
  return score;
}

/** Negamax with alpha-beta. depth 1-4 maps to the four difficulty tiers. */
export function bestMove(board: Board, color: Color, depth: number) {
  const moves = allLegalMoves(board, color);
  if (moves.length === 0) return null;
  if (depth <= 1) {
    // Novice: prefer captures, otherwise random.
    const scored = moves.map((m) => ({
      m,
      s: (board[m.to] ? PIECE_NAMES[board[m.to]!.type].value * 10 : 0) + Math.random() * 6,
    }));
    scored.sort((a, b) => b.s - a.s);
    return scored[0].m;
  }

  const search = (b: Board, c: Color, d: number, alpha: number, beta: number): number => {
    if (d === 0) return evaluate(b, c);
    const ms = allLegalMoves(b, c);
    if (ms.length === 0) return inCheck(b, c) ? -99999 + d : 0;
    let best = -Infinity;
    for (const m of ms) {
      const score = -search(applyMove(b, m.from, m.to), c === "w" ? "b" : "w", d - 1, -beta, -alpha);
      if (score > best) best = score;
      if (best > alpha) alpha = best;
      if (alpha >= beta) break;
    }
    return best;
  };

  let bestScore = -Infinity;
  let choice = moves[0];
  const ordered = moves
    .map((m) => ({ m, cap: board[m.to] ? PIECE_NAMES[board[m.to]!.type].value : 0 }))
    .sort((a, b) => b.cap - a.cap)
    .map((x) => x.m);
  for (const m of ordered) {
    const score = -search(
      applyMove(board, m.from, m.to),
      color === "w" ? "b" : "w",
      depth - 1,
      -Infinity,
      Infinity,
    );
    if (score > bestScore) {
      bestScore = score;
      choice = m;
    }
  }
  return choice;
}
