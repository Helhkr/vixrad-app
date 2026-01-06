"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { ThemeProvider } from "@mui/material/styles";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

import { getTheme } from "./theme";
import { AppStateProvider } from "./state";

export default function Providers({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);
  const theme = useMemo(() => getTheme(mode), [mode]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {mounted && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 1300 }}>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, value) => {
              if (value === null) return;
              setMode(value);
            }}
            aria-label="Tema"
            size="small"
          >
            <ToggleButton value="light" aria-label="Modo claro">
              <LightModeIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="dark" aria-label="Modo escuro">
              <DarkModeIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
      )}

      <AppStateProvider>{children}</AppStateProvider>
    </ThemeProvider>
  );
}
