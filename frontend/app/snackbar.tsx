"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useState } from "react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

type SnackbarSeverity = "success" | "error" | "warning" | "info";

type SnackbarContextType = {
  showMessage: (msg: string, severity?: SnackbarSeverity) => void;
};

const SnackbarContext = createContext<SnackbarContextType>({
  showMessage: () => {},
});

export const useSnackbar = () => useContext(SnackbarContext);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<SnackbarSeverity>("success");

  const showMessage = (msg: string, sev: SnackbarSeverity = "success") => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };

  return (
    <SnackbarContext.Provider value={{ showMessage }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <Alert severity={severity} onClose={() => setOpen(false)}>
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}
