import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronRight,
  Crown,
  Flame,
  Globe2,
  History,
  Palette,
  PlayCircle,
  Puzzle,
  Sparkles,
  Swords,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";

import { AppShell, SectionTitle } from "../components/AppShell";
import { KbachDivider } from "../components/KhmerOrnament";
import mascot from "../assets/hanuman-mascot.png";
import { useI18n } from "../lib/i18n";
import { GLYPHS, PIECE_NAMES, type PieceType } from "../lib/khmer-chess";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — Ouk Chatrang Khmer Chess" },
      {
        name: "description",
        content:
          "Your Ouk Chatrang hub: quick play vs AI, local matches, online ranked games, tactics lessons and leaderboards.",
      },
      { property: "og:title", content: "Home — Ouk Chatrang Khmer Chess" },
      {
        property: "og:description",
        content: "Quick play vs AI, ranked online matches, tactics lessons and leaderboards.",
      },
    ],
  }),
  component: HomePage,
});

const MODES = [
  { to: "/play", icon: Swords, title: "play_vs_ai", desc: "play_vs_ai_desc", tone: "gold" },
  { to: "/play", icon: Users, title: "local_2p", desc: "local_2p_desc", tone: "teak" },
  { to: "/online", icon: Globe2, title: "online_match", desc: "online_match_desc", tone: "jade" },
  { to: "/tactics", icon: Puzzle, title: "tactics_puzzles", desc: "tactics_puzzles_desc", tone: "gold" },
  { to: "/history", icon: History, title: "history_replays", desc: "history_replays_desc", tone: "teak" },
  { to: "/leaderboard", icon: Trophy, title: "leaderboard", desc: "leaderboard_desc", tone: "jade" },
  { to: "/settings", icon: Palette, title: "custom_themes", desc: "custom_themes_desc", tone: "gold" },
] as const;

const TONES: Record<string, string> = {
  gold: "bg-gold/15 text-gold-dark border-gold/40",
  teak: "bg-teak/10 text-teak border-teak/30",
  jade: "bg-jade/12 text-jade border-jade/35",
};

const PIECES: PieceType[] = ["k", "q", "b", "n", "r", "p"];

function HomePage() {
  const { t } = useI18n();

  return (
    <AppShell>
      <section className="kbach-frame animate-rise relative overflow-hidden rounded-3xl bg-card p-4">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold/20 blur-2xl" />
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-gold/40 bg-secondary">
            <UserRound className="h-6 w-6 text-gold-dark" />
          </div>
          <div className="flex-1">
            <p className="font-serif text-base font-semibold text-foreground">{t("guest")}</p>
            <p className="text-[11px] text-muted-foreground">{t("guest_mode")}</p>
          </div>
          <div className="text-right">
            <p className="flex items-center justify-end gap-1 text-sm font-bold text-gold-dark">
              <Flame className="h-3.5 w-3.5" /> 3
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">streak</p>
          </div>
        </div>

        <Link
          to="/play"
          className="shimmer-sheen bg-royal mt-4 flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-primary-foreground shadow-gold transition-transform duration-300 active:scale-[0.98]"
        >
          <span className="flex items-center gap-2.5">
            <PlayCircle className="h-6 w-6" />
            <span className="font-serif text-base font-semibold">{t("quick_play_ai")}</span>
          </span>
          <ChevronRight className="h-5 w-5" />
        </Link>
      </section>

      <div className="my-5">
        <KbachDivider />
      </div>

      <SectionTitle icon={Sparkles}>{t("game_modes")}</SectionTitle>
      <ul className="stagger-children grid gap-2.5">
        {MODES.map((m) => (
          <li key={m.title}>
            <Link
              to={m.to}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-temple"
            >
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${TONES[m.tone]}`}
              >
                <m.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-serif text-sm font-semibold text-foreground">
                  {t(m.title)}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {t(m.desc)}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-gold" />
            </Link>
          </li>
        ))}
      </ul>

      <div className="my-5">
        <KbachDivider />
      </div>

      <SectionTitle icon={Crown}>{t("pieces_guide")}</SectionTitle>
      <ul className="animate-rise grid grid-cols-3 gap-2.5">
        {PIECES.map((p) => (
          <li
            key={p}
            className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card px-2 py-3 transition-transform duration-300 hover:-translate-y-1"
          >
            <span className="text-2xl text-teak">{GLYPHS[p]}</span>
            <span className="font-serif text-xs font-semibold text-foreground">
              {PIECE_NAMES[p].km}
            </span>
            <span className="text-[10px] text-muted-foreground">{PIECE_NAMES[p].en}</span>
          </li>
        ))}
      </ul>

      <section className="kbach-frame animate-rise mt-5 flex items-center gap-3 rounded-3xl bg-secondary/60 p-4">
        <img
          src={mascot}
          alt="Hanuman coach"
          width={64}
          height={64}
          loading="lazy"
          className="animate-float h-16 w-16 shrink-0"
        />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-dark">
            {t("daily_wisdom")}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-foreground/80">
            “Advance the Trey together — a lone fish never crosses the Tonle.”
          </p>
        </div>
      </section>
    </AppShell>
  );
}
