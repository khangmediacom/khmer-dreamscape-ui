import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type BoardTheme = "sandstone" | "teak" | "ivory" | "jade";
export type PieceStyle = "cambodian" | "ada" | "ada-red";

type Settings = {
  dark: boolean;
  sound: boolean;
  motion: boolean;
  boardTheme: BoardTheme;
  pieceStyle: PieceStyle;
};

const DEFAULTS: Settings = {
  dark: false,
  sound: true,
  motion: true,
  boardTheme: "sandstone",
  pieceStyle: "cambodian",
};

const KEY = "ouk.settings";

type Ctx = Settings & { update: (patch: Partial<Settings>) => void };

const SettingsContext = createContext<Ctx>({ ...DEFAULTS, update: () => {} });

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      try {
        setSettings({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) });
      } catch {
        /* ignore malformed */
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.dark);
  }, [settings.dark]);

  const value = useMemo<Ctx>(
    () => ({
      ...settings,
      update: (patch) =>
        setSettings((prev) => {
          const next = { ...prev, ...patch };
          window.localStorage.setItem(KEY, JSON.stringify(next));
          return next;
        }),
    }),
    [settings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}

export const BOARD_THEMES: Record<BoardTheme, { light: string; dark: string; label: string }> = {
  sandstone: { light: "oklch(0.93 0.045 84)", dark: "oklch(0.72 0.08 62)", label: "Angkor Stone" },
  teak: { light: "oklch(0.9 0.05 80)", dark: "oklch(0.55 0.09 52)", label: "Royal Teak" },
  ivory: { light: "oklch(0.96 0.02 90)", dark: "oklch(0.78 0.05 88)", label: "Lotus Ivory" },
  jade: { light: "oklch(0.93 0.03 150)", dark: "oklch(0.58 0.08 165)", label: "Jade Temple" },
};
