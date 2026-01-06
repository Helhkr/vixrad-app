"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";

import { getTheme } from "./theme";
import { AppStateProvider } from "./state";

export default function Providers({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ position: "fixed", top: 16, right: 16, zIndex: 1300 }}>
        <button
          type="button"
          onClick={() => setMode(mode === "light" ? "dark" : "light")}
          aria-label={mode === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
        >
          {mode === "light" ? "🌙" : "☀️"}
        </button>
      </div>

      <AppStateProvider>{children}</AppStateProvider>
    </ThemeProvider>
  );
}
