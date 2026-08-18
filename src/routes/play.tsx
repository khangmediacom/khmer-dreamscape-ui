import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bot,
  Copy,
  Download,
  Home,
  Lightbulb,
  RotateCcw,
  Repeat,
  Share2,
  Swords,
  Undo2,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AppShell, SectionTitle } from "../components/AppShell";
import { CapturedRow, ChessBoard } from "../components/ChessBoard";
import { useI18n } from "../lib/i18n";
import {
  copyText,
  downloadText,
  plyToNotation,
  toFEN,
  toPGN,
  type Ply,
} from "../lib/khmer-chess-export";
import {
  GLYPHS,
  allLegalMoves,
  applyMove,
  bestMove,
  findKing,
  initialBoard,
  legalMoves,
  squareName,
  status,
  type Board,
  type Color,
} from "../lib/khmer-chess";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Play Ouk Chatrang — AI & Local Matches" },
      {
        name: "description",
        content:
          "Play Khmer chess against a four-tier AI or a friend on the same device, with hints, undo and move history.",
      },
      { property: "og:title", content: "Play Ouk Chatrang — AI & Local Matches" },
      {
        property: "og:description",
        content: "Four AI difficulty tiers, local two-player mode, hints and full move history.",
      },
    ],
  }),
  component: PlayPage,
});

const LEVELS = [
  { depth: 1, key: "novice" },
  { depth: 2, key: "apprentice" },
  { depth: 3, key: "master" },
  { depth: 4, key: "grandmaster" },
] as const;

type Mode = "ai" | "local";

function PlayPage() {
  const { t } = useI18n();
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<Mode>("ai");
  const [depth, setDepth] = useState(2);

  const [history, setHistory] = useState<Board[]>([initialBoard()]);
  const [turn, setTurn] = useState<Color>("w");
  const [selected, setSelected] = useState<number | null>(null);
  const [lastMove, setLastMove] = useState<{ from: number; to: number } | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [plies, setPlies] = useState<Ply[]>([]);
  const [captured, setCaptured] = useState<{ w: string[]; b: string[] }>({ w: [], b: [] });
  const [thinking, setThinking] = useState(false);
  const [hint, setHint] = useState<number[]>([]);
  const [copyState, setCopyState] = useState<"idle" | "ok" | "fail">("idle");

  const board = history[history.length - 1]!;
  const state = useMemo(() => status(board, turn), [board, turn]);
  const targets = selected === null ? hint : legalMoves(board, selected);
  const checkSquare =
    state === "check" || state === "checkmate" ? findKing(board, turn) : null;

  const fen = useMemo(
    () => toFEN(board, turn, Math.floor(plies.length / 2) + 1),
    [board, turn, plies.length],
  );

  const pgn = useMemo(
    () =>
      toPGN(plies, {
        event: mode === "ai" ? `Ouk Chatrang vs AI (${LEVELS[depth - 1]?.key ?? "ai"})` : "Ouk Chatrang local match",
        white: "White",
        black: mode === "ai" ? "Hanuman AI" : "Black",
        result:
          state === "checkmate" ? (turn === "w" ? "0-1" : "1-0") : state === "stalemate" ? "1/2-1/2" : "*",
      }),
    [plies, mode, depth, state, turn],
  );

  const reset = useCallback(() => {
    setHistory([initialBoard()]);
    setTurn("w");
    setSelected(null);
    setLastMove(null);
    setPlies([]);
    setCaptured({ w: [], b: [] });
    setHint([]);
    setCopyState("idle");
  }, []);

  const commit = useCallback(
    (from: number, to: number) => {
      const b = history[history.length - 1]!;
      const piece = b[from];
      if (!piece) return;
      const taken = b[to];
      const next = applyMove(b, from, to);
      setHistory((h) => [...h, next]);
      setPlies((m) => [
        ...m,
        {
          from,
          to,
          type: piece.type,
          color: piece.color,
          captured: taken ? taken.type : null,
          promotion: next[to]!.type !== piece.type,
        },
      ]);
      if (taken) {
        setCaptured((c) => ({
          ...c,
          [taken.color]: [...c[taken.color], GLYPHS[taken.type]],
        }));
      }
      setLastMove({ from, to });
      setSelected(null);
      setHint([]);
      setTurn(piece.color === "w" ? "b" : "w");
    },
    [history],
  );

  const share = useCallback(
    async (text: string) => {
      const ok = await copyText(text);
      setCopyState(ok ? "ok" : "fail");
      setTimeout(() => setCopyState("idle"), 1600);
    },
    [],
  );


  useEffect(() => {
    if (!started || mode !== "ai" || turn !== "b") return;
    if (state === "checkmate" || state === "stalemate") return;
    setThinking(true);
    const id = setTimeout(() => {
      const mv = bestMove(board, "b", depth);
      if (mv) commit(mv.from, mv.to);
      setThinking(false);
    }, 320);
    return () => clearTimeout(id);
  }, [started, mode, turn, board, depth, state, commit]);

  function onSquare(i: number) {
    if (state === "checkmate" || state === "stalemate") return;
    if (mode === "ai" && turn === "b") return;
    const piece = board[i];
    if (selected !== null && legalMoves(board, selected).includes(i)) {
      commit(selected, i);
      return;
    }
    if (piece && piece.color === turn) {
      setSelected(i === selected ? null : i);
      setHint([]);
    } else {
      setSelected(null);
    }
  }

  function undo() {
    if (history.length < 2) return;
    const back = mode === "ai" && history.length > 2 ? 2 : 1;
    setHistory((h) => h.slice(0, h.length - back));
    setMoves((m) => m.slice(0, m.length - back));
    setLastMove(null);
    setSelected(null);
    setHint([]);
    if (back === 1) setTurn(turn === "w" ? "b" : "w");
  }

  function showHint() {
    const mv = bestMove(board, turn, 2);
    if (mv) {
      setSelected(mv.from);
      setHint([mv.to]);
    }
  }

  const banner =
    state === "checkmate"
      ? turn === "w"
        ? t("black_wins")
        : t("white_wins")
      : state === "stalemate"
        ? t("stalemate")
        : state === "check"
          ? t("check")
          : thinking
            ? t("ai_thinking")
            : turn === "w"
              ? t("your_turn")
              : t("black");

  if (!started) {
    return (
      <AppShell title={t("play")} subtitle={t("choose_difficulty")}>
        <div className="stagger-children grid gap-2.5">
          {(
            [
              { m: "ai", icon: Bot, title: "play_vs_ai", desc: "play_vs_ai_desc" },
              { m: "local", icon: Users, title: "local_2p", desc: "local_2p_desc" },
            ] as const
          ).map((o) => (
            <button
              key={o.m}
              type="button"
              onClick={() => setMode(o.m)}
              className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-300 ${
                mode === o.m
                  ? "border-gold bg-gold/15 shadow-gold"
                  : "border-border bg-card hover:border-gold/60"
              }`}
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-gold/40 bg-secondary">
                <o.icon className="h-5 w-5 text-gold-dark" />
              </span>
              <span>
                <span className="block font-serif text-sm font-semibold text-foreground">
                  {t(o.title)}
                </span>
                <span className="block text-[11px] text-muted-foreground">{t(o.desc)}</span>
              </span>
            </button>
          ))}
        </div>

        {mode === "ai" ? (
          <div className="mt-5">
            <SectionTitle icon={Swords}>{t("choose_difficulty")}</SectionTitle>
            <div className="grid grid-cols-2 gap-2.5">
              {LEVELS.map((l) => (
                <button
                  key={l.key}
                  type="button"
                  onClick={() => setDepth(l.depth)}
                  className={`rounded-2xl border px-3 py-3 font-serif text-sm font-semibold transition-all duration-300 ${
                    depth === l.depth
                      ? "border-gold bg-gold/15 text-gold-dark scale-[1.02]"
                      : "border-border bg-secondary/60 text-foreground hover:border-gold/60"
                  }`}
                >
                  {t(l.key)}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => {
            reset();
            setStarted(true);
          }}
          className="shimmer-sheen bg-royal mt-6 w-full rounded-2xl px-5 py-3.5 font-serif text-base font-semibold text-primary-foreground shadow-gold transition-transform duration-300 active:scale-[0.98]"
        >
          {t("start_match")}
        </button>
      </AppShell>
    );
  }

  return (
    <AppShell title={t("play")} subtitle={banner}>
      <div className="animate-rise">
        <div className="mb-2 flex items-center justify-between rounded-2xl border border-border bg-card px-3 py-2">
          <span className="font-serif text-sm font-semibold text-foreground">{banner}</span>
          <CapturedRow pieces={captured.b} color="b" />
        </div>

        <ChessBoard
          board={board}
          selected={selected}
          targets={targets}
          lastMove={lastMove}
          checkSquare={checkSquare}
          flipped={flipped}
          onSquare={onSquare}
        />

        <div className="mt-2 flex items-center justify-between rounded-2xl border border-border bg-card px-3 py-2">
          <span className="text-[11px] text-muted-foreground">{t("captured")}</span>
          <CapturedRow pieces={captured.w} color="w" />
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {(
            [
              { fn: undo, icon: Undo2, key: "undo" },
              { fn: showHint, icon: Lightbulb, key: "hint" },
              { fn: () => setFlipped((f) => !f), icon: Repeat, key: "flip_board" },
              { fn: reset, icon: RotateCcw, key: "new_game" },
            ] as const
          ).map((b) => (
            <button
              key={b.key}
              type="button"
              onClick={b.fn}
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-secondary/60 py-2 text-[10px] font-medium text-foreground transition-all duration-300 hover:border-gold/60 active:scale-95"
            >
              <b.icon className="h-4 w-4 text-gold-dark" />
              {t(b.key)}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <SectionTitle>{t("move_history")}</SectionTitle>
          <ol className="grid grid-cols-2 gap-1 rounded-2xl border border-border bg-card p-3 text-[11px] text-muted-foreground">
            {moves.length === 0 ? <li>—</li> : null}
            {moves.map((m, i) => (
              <li key={`${m}-${i}`} className="truncate">
                <span className="text-gold-dark">{i + 1}.</span> {m}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setStarted(false)}
            className="flex-1 rounded-2xl border border-border bg-secondary/60 py-3 text-sm font-semibold text-foreground"
          >
            {t("resign")}
          </button>
          <Link
            to="/home"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-gold/50 bg-gold/10 py-3 text-sm font-semibold text-gold-dark"
          >
            <Home className="h-4 w-4" />
            {t("return_home")}
          </Link>
        </div>
        <p className="sr-only">{allLegalMoves(board, turn).length}</p>
      </div>
    </AppShell>
  );
}
