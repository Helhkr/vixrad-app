"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
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
import { formatReportForCopy, stripMarkdown, convertMarkdownToHtml, type CopyFormat } from "@/features/reportCopyFormat";

export default function ReportResultPage() {
  const router = useRouter();
  const { reportText, resetReport } = useAppState();
  const { showMessage } = useSnackbar();

  const displayHtml = useMemo(() => {
    return convertMarkdownToHtml(reportText);
  }, [reportText]);

  const options: Array<{ label: string; format: CopyFormat }> = [
    { label: "Formatação padrão", format: "formatted" },
    { label: "Sem formatação", format: "plain" },
    { label: "Copiar como markdown", format: "markdown" },
  ];

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFormat, setSelectedFormat] = useState<CopyFormat>("formatted");

  const copyReport = async (format: CopyFormat) => {
    const copyHtmlViaExecCommand = async (html: string, plainFallback: string) => {
      try {
        const el = document.createElement("div");
        el.setAttribute("contenteditable", "true");
        el.style.position = "fixed";
        el.style.left = "-9999px";
        el.style.top = "0";
        el.style.whiteSpace = "pre-wrap";
        el.innerHTML = html;
        document.body.appendChild(el);
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        const ok = document.execCommand("copy");
        sel?.removeAllRanges();
        document.body.removeChild(el);
        if (!ok) throw new Error("execCommand copy returned false");
        return true;
      } catch {
        try {
          await navigator.clipboard.writeText(plainFallback);
          return true;
        } catch {
          return false;
        }
      }
    };
    try {
      if (format === "formatted") {
        const html = convertMarkdownToHtml(reportText);
        const plain = stripMarkdown(reportText);
        if ("ClipboardItem" in window) {
          const item = new ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
            "text/plain": new Blob([plain], { type: "text/plain" }),
          });
          await (navigator.clipboard as any).write([item]);
        } else {
          const ok = await copyHtmlViaExecCommand(html, plain);
          if (!ok) throw new Error("Falha ao copiar em modo formatado");
        }
      } else {
        const output = formatReportForCopy(reportText, format);
        await navigator.clipboard.writeText(output);
      }
      showMessage("Laudo copiado com sucesso!", "success");
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "Falha ao copiar laudo", "error");
    }
  };

  if (!reportText) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Stack spacing={2}>
          <IconButton
            onClick={() => router.back()}
            sx={(theme) => ({
              alignSelf: "flex-start",
              color: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
              },
            })}
          >
            <ArrowCircleLeftIcon />
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
        <IconButton
          onClick={() => router.back()}
          sx={(theme) => ({
            alignSelf: "flex-start",
            color: theme.palette.primary.main,
            "&:hover": {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            },
          })}
        >
          <ArrowCircleLeftIcon />
        </IconButton>

        <Typography variant="h6" component="h1">
          Laudo
        </Typography>

        <Paper elevation={2} sx={{ p: 4 }}>
          <div dangerouslySetInnerHTML={{ __html: displayHtml }} />
        </Paper>

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

        <Box mt={4} textAlign="center">
          <Button variant="text" color="error" onClick={() => {
            resetReport();
            router.push("/templates");
          }}>
            INICIAR NOVO LAUDO
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}
