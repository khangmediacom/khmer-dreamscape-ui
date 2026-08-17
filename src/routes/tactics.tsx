import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, CheckCircle2, GraduationCap, Target } from "lucide-react";
import { useState } from "react";

import { AppShell, SectionTitle } from "../components/AppShell";
import { KbachDivider } from "../components/KhmerOrnament";
import { useI18n } from "../lib/i18n";
import { GLYPHS, PIECE_NAMES, type PieceType } from "../lib/khmer-chess";

export const Route = createFileRoute("/tactics")({
  head: () => ({
    meta: [
      { title: "Tactics & Lessons — Ouk Chatrang" },
      {
        name: "description",
        content:
          "Learn authentic Ouk Chatrang rules, piece movement and classic Khmer chess traps through guided lessons.",
      },
      { property: "og:title", content: "Tactics & Lessons — Ouk Chatrang" },
      {
        property: "og:description",
        content: "Guided lessons on Khmer chess piece movement, openings and endgame traps.",
      },
    ],
  }),
  component: TacticsPage,
});

const LESSONS: { id: string; piece: PieceType; title: string; goal: string }[] = [
  { id: "l1", piece: "p", title: "Trey advance", goal: "Push connected fish to the sixth rank to promote into a Neang." },
  { id: "l2", piece: "q", title: "Neang first leap", goal: "Use the Neang's two-square opening leap to seize the centre." },
  { id: "l3", piece: "b", title: "Koul wedge", goal: "The elephant walks diagonally or one step forward — build a wedge." },
  { id: "l4", piece: "n", title: "Ses double attack", goal: "Fork the Sdech and Touk with a single horse leap." },
  { id: "l5", piece: "r", title: "Touk on open files", goal: "Open a file and let the boat sweep the enemy camp." },
  { id: "l6", piece: "k", title: "Sdech safety", goal: "Shelter the king behind fish before launching an attack." },
];

function TacticsPage() {
  const { t } = useI18n();
  const [done, setDone] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(LESSONS[0]!.id);

  return (
    <AppShell title={t("tactics_title")} subtitle={t("tactics_subtitle")}>
      <section className="kbach-frame animate-rise flex items-center gap-3 rounded-3xl bg-card p-4">
        <span className="grid h-12 w-12 place-items-center rounded-2xl border border-gold/40 bg-secondary">
          <GraduationCap className="h-6 w-6 text-gold-dark" />
        </span>
        <div className="flex-1">
          <p className="font-serif text-sm font-semibold text-foreground">{t("tactics_title")}</p>
          <p className="text-[11px] text-muted-foreground">
            {done.length}/{LESSONS.length} {t("solved")}
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="bg-royal h-full rounded-full transition-all duration-500"
              style={{ width: `${(done.length / LESSONS.length) * 100}%` }}
            />
          </div>
        </div>
      </section>

      <div className="my-5">
        <KbachDivider />
      </div>

      <SectionTitle icon={BookOpen}>{t("tactics_subtitle")}</SectionTitle>
      <ul className="stagger-children grid gap-2.5">
        {LESSONS.map((l) => {
          const solved = done.includes(l.id);
          const expanded = open === l.id;
          return (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : l.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-300 ${
                  solved ? "border-jade/50 bg-jade/10" : "border-border bg-card hover:border-gold/60"
                }`}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-teak/30 bg-teak/10 text-2xl text-teak">
                  {GLYPHS[l.piece]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-serif text-sm font-semibold text-foreground">
                    {l.title}
                  </span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {PIECE_NAMES[l.piece].km} · {PIECE_NAMES[l.piece].en}
                  </span>
                </span>
                {solved ? <CheckCircle2 className="h-5 w-5 text-jade" /> : null}
              </button>

              {expanded ? (
                <div className="animate-rise mt-1.5 rounded-2xl border border-gold/30 bg-secondary/50 p-3">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-dark">
                    <Target className="h-3.5 w-3.5" />
                    {t("objective")}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-foreground/80">{l.goal}</p>
                  <button
                    type="button"
                    onClick={() => setDone((d) => (d.includes(l.id) ? d : [...d, l.id]))}
                    className="bg-royal mt-3 w-full rounded-xl px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-transform duration-300 active:scale-95"
                  >
                    {solved ? t("lesson_complete") : t("solved")}
                  </button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}
