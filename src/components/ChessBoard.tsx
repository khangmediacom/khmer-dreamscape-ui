import { GLYPHS, squareName, type Board, type Color } from "../lib/khmer-chess";
import { BOARD_THEMES, useSettings } from "../lib/settings";

export function ChessBoard({
  board,
  selected,
  targets,
  lastMove,
  checkSquare,
  flipped,
  onSquare,
}: {
  board: Board;
  selected: number | null;
  targets: number[];
  lastMove: { from: number; to: number } | null;
  checkSquare: number | null;
  flipped: boolean;
  onSquare: (i: number) => void;
}) {
  const { boardTheme, pieceStyle, motion } = useSettings();
  const theme = BOARD_THEMES[boardTheme];
  const order = Array.from({ length: 64 }, (_, i) => (flipped ? 63 - i : i));

  return (
    <div className="kbach-frame bg-royal rounded-2xl p-2">
      <div className="grid grid-cols-8 overflow-hidden rounded-xl">
        {order.map((i) => {
          const piece = board[i];
          const isDark = (Math.floor(i / 8) + (i % 8)) % 2 === 1;
          const isTarget = targets.includes(i);
          const isSelected = selected === i;
          const isLast = lastMove && (lastMove.from === i || lastMove.to === i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSquare(i)}
              aria-label={squareName(i)}
              className="relative aspect-square select-none"
              style={{ background: isDark ? theme.dark : theme.light }}
            >
              {isLast ? <span className="absolute inset-0 bg-gold/35" /> : null}
              {isSelected ? (
                <span className="absolute inset-0 ring-2 ring-inset ring-gold-dark" />
              ) : null}
              {checkSquare === i ? (
                <span className="absolute inset-0 animate-pulse bg-destructive/45" />
              ) : null}
              {isTarget && !piece ? (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="h-1/4 w-1/4 rounded-full bg-teak-dark/45" />
                </span>
              ) : null}
              {isTarget && piece ? (
                <span className="absolute inset-0 ring-[3px] ring-inset ring-destructive/70" />
              ) : null}
              {piece ? (
                <span
                  className={`absolute inset-0 flex items-center justify-center text-[clamp(18px,6.4vw,34px)] leading-none ${
                    motion ? "animate-pop" : ""
                  }`}
                  style={{
                    color:
                      piece.color === "w"
                        ? "oklch(0.99 0.01 90)"
                        : pieceStyle === "ada-red"
                          ? "oklch(0.45 0.17 28)"
                          : "oklch(0.26 0.05 48)",
                    textShadow:
                      piece.color === "w"
                        ? "0 1px 2px oklch(0.28 0.07 46 / 0.8)"
                        : "0 1px 1px oklch(0.99 0.02 90 / 0.35)",
                  }}
                >
                  {GLYPHS[piece.type]}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CapturedRow({ pieces, color }: { pieces: string[]; color: Color }) {
  return (
    <div className="flex min-h-6 flex-wrap items-center gap-0.5 text-lg leading-none">
      {pieces.map((g, i) => (
        <span
          key={i}
          className="animate-pop"
          style={{ color: color === "w" ? "oklch(0.75 0.03 82)" : "oklch(0.4 0.05 48)" }}
        >
          {g}
        </span>
      ))}
    </div>
  );
}
