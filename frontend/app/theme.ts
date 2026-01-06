import { createTheme } from "@mui/material/styles";

export const getTheme = (mode: "light" | "dark") => {
  const theme = createTheme({
    palette: {
      mode,
    },
    shape: {
      borderRadius: 8,
    },
  });

  theme.palette.secondary.main = theme.palette.primary.dark;
  return theme;
};
