import { createFileRoute } from "@tanstack/react-router";
import { Globe2, KeyRound, Loader2, Users2, Zap } from "lucide-react";
import { useState } from "react";

import { AppShell, SectionTitle } from "../components/AppShell";
import { KbachDivider } from "../components/KhmerOrnament";
import { useI18n } from "../lib/i18n";

export const Route = createFileRoute("/online")({
  head: () => ({
    meta: [
      { title: "Online Matches — Ouk Chatrang" },
      {
        name: "description",
        content:
          "Find a quick Ouk Chatrang opponent online or create a private room PIN to play with friends.",
      },
      { property: "og:title", content: "Online Matches — Ouk Chatrang" },
      {
        property: "og:description",
        content: "Quick matchmaking and private friend rooms for Khmer chess.",
      },
    ],
  }),
  component: OnlinePage,
});

function OnlinePage() {
  const { t } = useI18n();
  const [searching, setSearching] = useState(false);
  const [pin, setPin] = useState("");
  const [room, setRoom] = useState<string | null>(null);

  return (
    <AppShell title={t("online_matchmaking")} subtitle={t("online_matchmaking_desc")}>
      <section className="kbach-frame animate-rise relative overflow-hidden rounded-3xl bg-card p-4">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-jade/20 blur-2xl" />
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl border border-jade/40 bg-jade/10">
            <Globe2 className="h-6 w-6 text-jade" />
          </span>
          <div>
            <p className="font-serif text-sm font-semibold text-foreground">{t("quick_match")}</p>
            <p className="text-[11px] text-muted-foreground">{t("quick_match_desc")}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSearching((s) => !s)}
          className="shimmer-sheen bg-royal mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 font-serif text-base font-semibold text-primary-foreground shadow-gold transition-transform duration-300 active:scale-[0.98]"
        >
          {searching ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t("searching_opponent")}
            </>
          ) : (
            <>
              <Zap className="h-5 w-5" />
              {t("find_match")}
            </>
          )}
        </button>
      </section>

      <div className="my-5">
        <KbachDivider />
      </div>

      <SectionTitle icon={Users2}>{t("private_match")}</SectionTitle>
      <div className="animate-rise grid gap-2.5 rounded-3xl border border-border bg-card p-4">
        <button
          type="button"
          onClick={() => setRoom(String(Math.floor(100000 + Math.random() * 900000)))}
          className="flex items-center justify-center gap-2 rounded-2xl border border-gold/50 bg-gold/10 px-4 py-3 text-sm font-semibold text-gold-dark transition-transform duration-300 active:scale-95"
        >
          <KeyRound className="h-4 w-4" />
          {t("create_room_pin")}
        </button>
        {room ? (
          <p className="animate-rise text-center font-serif text-2xl font-bold tracking-[0.4em] text-foreground">
            {room}
          </p>
        ) : null}

        <div className="flex gap-2">
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            placeholder={t("enter_pin")}
            aria-label={t("enter_pin")}
            className="min-w-0 flex-1 rounded-2xl border border-border bg-secondary/60 px-3 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-gold"
          />
          <button
            type="button"
            disabled={pin.length !== 6}
            className="bg-royal rounded-2xl px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
          >
            {t("join")}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
