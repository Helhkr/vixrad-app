"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { apiPost } from "@/features/api";

import { useAppState } from "./state";
import { useSnackbar } from "./snackbar";

type AuthResponse = {
	accessToken: string;
	refreshToken: string;
};

export default function AuthPage() {
	const router = useRouter();
	const { setAccessToken, resetReport } = useAppState();
	const { showMessage } = useSnackbar();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const run = async (mode: "login" | "register") => {
		setLoading(true);
		try {
			const data = await apiPost<AuthResponse>(`/auth/${mode}`, { email, password });
			setAccessToken(data.accessToken);
			resetReport();
			showMessage(
				mode === "login" ? "Login realizado com sucesso!" : "Usuário registrado com sucesso!",
				"success",
			);
			router.push("/templates");
		} catch (e) {
			showMessage(e instanceof Error ? e.message : "Erro ao autenticar", "error");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container maxWidth="sm" sx={{ py: 6 }}>
			<Paper sx={{ p: 3 }}>
				<Stack spacing={2}>
					<Box>
						<Typography variant="h5" component="h1">
							Vixrad
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Login/Registro
						</Typography>
					</Box>

					<TextField
						label="Email"
						type="email"
						fullWidth
						margin="normal"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						autoComplete="email"
					/>

					<TextField
						label="Senha"
						type="password"
						fullWidth
						margin="normal"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						autoComplete="current-password"
					/>

					<Stack direction="row" spacing={2}>
						<Button
							variant="contained"
							color="primary"
							disabled={loading}
							onClick={() => run("login")}
						>
							Entrar
						</Button>
						<Button
							variant="outlined"
							color="primary"
							disabled={loading}
							onClick={() => run("register")}
						>
							Registrar
						</Button>
					</Stack>

					{loading ? (
						<Box display="flex" justifyContent="center" mt={2}>
							<CircularProgress />
						</Box>
					) : null}
				</Stack>
			</Paper>
		</Container>
	);
}

