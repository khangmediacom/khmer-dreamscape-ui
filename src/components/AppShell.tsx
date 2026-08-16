import { Link, useRouterState } from "@tanstack/react-router";
import { Crown, Gamepad2, GraduationCap, Home, Settings, Users } from "lucide-react";
import type { ReactNode } from "react";

import { useI18n } from "../lib/i18n";
import { KbachDivider, LotusMandala } from "./KhmerOrnament";
import mascot from "../assets/hanuman-mascot.png";

const NAV = [
  { to: "/home", icon: Home, key: "home" },
  { to: "/play", icon: Gamepad2, key: "play" },
  { to: "/tactics", icon: GraduationCap, key: "learn" },
  { to: "/leaderboard", icon: Crown, key: "ranks" },
  { to: "/settings", icon: Settings, key: "settings" },
] as const;

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="temple-grain absolute inset-0 opacity-60" />
        <LotusMandala className="animate-spin-slow absolute -right-24 -top-24 h-72 w-72 opacity-[0.18]" />
        <LotusMandala className="animate-spin-slow absolute -left-28 bottom-10 h-64 w-64 opacity-[0.12]" />
      </div>

      <header className="bg-temple sticky top-0 z-20 border-b border-gold/30 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-lg items-center gap-3 px-4 py-3">
          <div className="relative">
            <span className="animate-glow absolute inset-0 rounded-full bg-gold/40 blur-md" />
            <img
              src={mascot}
              alt="Hanuman mascot"
              width={40}
              height={40}
              loading="lazy"
              className="relative h-10 w-10 rounded-full border border-gold/60 bg-secondary object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-serif truncate text-base font-semibold text-foreground">
              {title ?? t("app_title")}
            </h1>
            <p className="truncate text-[11px] text-muted-foreground">
              {subtitle ?? t("app_subtitle")}
            </p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-jade/40 bg-jade/10 px-2.5 py-1 text-[10px] font-medium text-jade">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-jade opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-jade" />
            </span>
            {t("online_count")}
          </span>
        </div>
        <KbachDivider className="h-3 opacity-70" />
      </header>

      <main className="relative z-10 mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-4">
        {children}
      </main>

      <nav className="bg-temple fixed bottom-0 left-0 right-0 z-20 border-t border-gold/30 backdrop-blur-md">
        <ul className="mx-auto flex w-full max-w-lg items-stretch justify-between px-2 py-1.5">
          {NAV.map(({ to, icon: Icon, key }) => {
            const active = pathname === to;
            return (
              <li key={to} className="flex-1">
                <Link
                  to={to}
                  className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2 transition-all duration-300 ${
                    active
                      ? "bg-gold/15 text-gold-dark"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 transition-transform duration-300 ${
                      active ? "-translate-y-0.5 scale-110" : ""
                    }`}
                  />
                  <span className="text-[10px] font-medium">{t(key)}</span>
                  <span
                    className={`h-0.5 w-5 rounded-full bg-royal transition-opacity duration-300 ${
                      active ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function SectionTitle({ icon: Icon, children }: { icon?: typeof Users; children: ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {Icon ? <Icon className="h-3.5 w-3.5 text-gold" /> : null}
      {children}
    </h2>
  );
}
