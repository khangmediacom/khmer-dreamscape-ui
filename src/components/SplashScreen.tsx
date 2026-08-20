import { useEffect, useState } from "react";

import mascot from "../assets/hanuman-mascot.png";
import { useI18n } from "../lib/i18n";

const SESSION_KEY = "ouk.splash.seen";
const HOLD_MS = 1100;
const FADE_MS = 400;

let shownOnce = false;

/**
 * One-shot launch screen. Renders as a full-screen overlay above the app,
 * fades itself out after the first paint and never mounts again in the same
 * session. No loops, no intervals, no audio.
 */
export function SplashScreen() {
  const { t } = useI18n();
  const [phase, setPhase] = useState<"hidden" | "shown" | "leaving">("hidden");

  // Decide once per session, after hydration (keeps SSR markup and client in sync).
  useEffect(() => {
    if (shownOnce || window.sessionStorage.getItem(SESSION_KEY)) return;
    shownOnce = true;
    window.sessionStorage.setItem(SESSION_KEY, "1");
    setPhase("shown");
  }, []);

  // One bounded timeout per phase: hold briefly, fade out, unmount. No loops.
  useEffect(() => {
    if (phase === "hidden") return;
    const next = phase === "shown" ? "leaving" : "hidden";
    const id = window.setTimeout(() => setPhase(next), phase === "shown" ? HOLD_MS : FADE_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  if (phase === "hidden") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`splash-obsidian fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-[400ms] ease-out ${
        phase === "leaving" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative flex items-center justify-center">
        <span className="splash-glow absolute h-44 w-44 rounded-full" />
        <img
          src={mascot}
          alt=""
          width={1024}
          height={1024}
          className="splash-logo relative h-40 w-40 object-contain"
        />
      </div>
      <div className="splash-text mt-6 flex flex-col items-center">
        <p className="font-serif text-2xl font-bold uppercase tracking-[0.28em] text-gold-light">
          {t("splash_title")}
        </p>
        <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-gold/80">
          {t("splash_subtitle")}
        </p>
      </div>
    </div>
  );
}
