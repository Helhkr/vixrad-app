"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { ThemeProvider } from "@mui/material/styles";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

import { getTheme } from "./theme";
import { AppStateProvider, useAppState } from "./state";
import { SnackbarProvider, useSnackbar } from "./snackbar";

function TopRightControls(params: {
  mode: "light" | "dark";
  setMode: (value: "light" | "dark") => void;
}) {
  const { urgent, setUrgent } = useAppState();
  const { showMessage } = useSnackbar();

  return (
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 1300 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Tooltip title="O modo de urgência adiciona uma nota ao final do laudo informando que o exame foi laudado em regime de urgência.">
          <IconButton
            aria-label="Urgência"
            onClick={() => {
              const next = !urgent;
              setUrgent(next);
              showMessage(
                next ? "Módulo de exames de urgência ativado." : "Módulo de exames de urgência desativado.",
                next ? "info" : "info",
              );
            }}
            sx={(theme) => ({
              color: urgent ? theme.palette.error.main : theme.palette.text.secondary,
            })}
            size="small"
          >
            <LocalHospitalIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <ToggleButtonGroup
          value={params.mode}
          exclusive
          onChange={(_, value) => {
            if (value === null) return;
            params.setMode(value);
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
      </Stack>
    </div>
  );
}

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

      <AppStateProvider>
        <SnackbarProvider>
          {mounted && <TopRightControls mode={mode} setMode={setMode} />}
          {children}
        </SnackbarProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}
