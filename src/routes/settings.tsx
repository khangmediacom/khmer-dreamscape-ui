import { createFileRoute } from "@tanstack/react-router";
import { Check, Languages, Moon, Palette, Sparkles, Volume2 } from "lucide-react";

import { AppShell, SectionTitle } from "../components/AppShell";
import { KbachDivider } from "../components/KhmerOrnament";
import { LANGUAGES, useI18n } from "../lib/i18n";
import { BOARD_THEMES, useSettings, type BoardTheme } from "../lib/settings";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Ouk Chatrang Board Themes & Language" },
      {
        name: "description",
        content:
          "Choose your language, board theme, night temple mode, sound effects and animations for Ouk Chatrang.",
      },
      { property: "og:title", content: "Settings — Ouk Chatrang" },
      {
        property: "og:description",
        content: "Language, Angkor board themes, night mode, sound and motion preferences.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { t, lang, setLang } = useI18n();
  const { dark, sound, motion, boardTheme, update } = useSettings();

  const toggles = [
    { key: "dark_mode", icon: Moon, on: dark, set: (v: boolean) => update({ dark: v }) },
    { key: "sound_effects", icon: Volume2, on: sound, set: (v: boolean) => update({ sound: v }) },
    { key: "animations", icon: Sparkles, on: motion, set: (v: boolean) => update({ motion: v }) },
  ] as const;

  return (
    <AppShell title={t("settings")} subtitle={t("preferences")}>
      <SectionTitle icon={Languages}>{t("language_section")}</SectionTitle>
      <div className="stagger-children grid grid-cols-2 gap-2.5">
        {LANGUAGES.map((l) => {
          const on = lang === l.code;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => setLang(l.code)}
              className={`flex items-center gap-2.5 rounded-2xl border px-3 py-3 text-left transition-all duration-300 ${
                on ? "border-gold bg-gold/15 shadow-gold" : "border-border bg-card hover:border-gold/60"
              }`}
            >
              <span className="text-xl leading-none">{l.flag}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {l.native}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">{l.name}</span>
              </span>
              {on ? <Check className="h-4 w-4 text-gold-dark" /> : null}
            </button>
          );
        })}
      </div>

      <div className="my-5">
        <KbachDivider />
      </div>

      <SectionTitle icon={Palette}>{t("board_theme")}</SectionTitle>
      <div className="grid grid-cols-2 gap-2.5">
        {(Object.keys(BOARD_THEMES) as BoardTheme[]).map((key) => {
          const th = BOARD_THEMES[key];
          const on = boardTheme === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => update({ boardTheme: key })}
              className={`rounded-2xl border p-2.5 text-left transition-all duration-300 ${
                on ? "border-gold bg-gold/10 shadow-gold" : "border-border bg-card hover:border-gold/60"
              }`}
            >
              <span className="grid grid-cols-4 overflow-hidden rounded-lg">
                {Array.from({ length: 8 }, (_, i) => (
                  <span
                    key={i}
                    className="aspect-square"
                    style={{
                      background:
                        (Math.floor(i / 4) + (i % 4)) % 2 === 1 ? th.dark : th.light,
                    }}
                  />
                ))}
              </span>
              <span className="mt-2 block truncate font-serif text-xs font-semibold text-foreground">
                {th.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="my-5">
        <KbachDivider />
      </div>

      <SectionTitle icon={Sparkles}>{t("preferences")}</SectionTitle>
      <ul className="grid gap-2">
        {toggles.map((o) => (
          <li key={o.key}>
            <button
              type="button"
              onClick={() => o.set(!o.on)}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-colors duration-300 hover:border-gold/60"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-gold/30 bg-secondary">
                <o.icon className="h-4 w-4 text-gold-dark" />
              </span>
              <span className="flex-1 text-sm font-medium text-foreground">{t(o.key)}</span>
              <span
                className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${
                  o.on ? "bg-gold" : "bg-secondary"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform duration-300 ${
                    o.on ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
