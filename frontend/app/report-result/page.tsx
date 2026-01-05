"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { useAppState } from "../state";
import { useSnackbar } from "../snackbar";
import { formatReportForCopy, type CopyFormat } from "@/features/reportCopyFormat";

export default function ReportResultPage() {
  const router = useRouter();
  const { reportText } = useAppState();
  const { showMessage } = useSnackbar();
  const [copied, setCopied] = useState(false);

  const options: Array<{ label: string; format: CopyFormat }> = [
    { label: "Formatação padrão", format: "formatted" },
    { label: "Sem formatação", format: "plain" },
    { label: "Copiar como markdown", format: "markdown" },
  ];

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFormat, setSelectedFormat] = useState<CopyFormat>("formatted");

  const copyReport = async (format: CopyFormat) => {
    const output = formatReportForCopy(reportText, format);
    await navigator.clipboard.writeText(output);
    showMessage("Laudo copiado com sucesso!", "success");

    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  if (!reportText) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Stack spacing={2}>
          <IconButton onClick={() => router.back()}>
            <ArrowBackIcon />
          </IconButton>

          <Alert severity="error">Nenhum laudo disponível. Gere um laudo novamente.</Alert>
          <Button variant="contained" onClick={() => router.replace("/report-form")}
          >
            Voltar
          </Button>

          <Box mt={4} textAlign="center">
            <Button variant="text" color="error" onClick={() => router.push("/templates")}>
              INICIAR NOVO LAUDO
            </Button>
          </Box>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={2}>
        <IconButton onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>

        <Typography variant="h6" component="h1">
          Laudo
        </Typography>

        <Paper sx={{ p: 2, whiteSpace: "pre-wrap" }}>{reportText}</Paper>

        <ButtonGroup variant="contained">
          <Button onClick={() => copyReport(selectedFormat)}>COPIAR LAUDO</Button>
          <Button onClick={(e) => setAnchorEl(e.currentTarget)}>
            <ArrowDropDownIcon />
          </Button>
        </ButtonGroup>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          {options.map((opt) => (
            <MenuItem
              key={opt.format}
              onClick={() => {
                setSelectedFormat(opt.format);
                setAnchorEl(null);
                void copyReport(opt.format);
              }}
            >
              {opt.label}
            </MenuItem>
          ))}
        </Menu>

        {copied ? (
          <Typography variant="body2" color="text.secondary">
            Copiado.
          </Typography>
        ) : null}

        <Box mt={4} textAlign="center">
          <Button variant="text" color="error" onClick={() => router.push("/templates")}>
            INICIAR NOVO LAUDO
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}
