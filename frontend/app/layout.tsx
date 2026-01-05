import type { ReactNode } from "react";
import Providers from "./providers";
import { SnackbarProvider } from "./snackbar";

export const metadata = {
	title: "Vixrad",
	description: "Editor de laudos estruturados (sem persistência de conteúdo clínico)."
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="pt-BR">
			<body>
				<Providers>
					<SnackbarProvider>{children}</SnackbarProvider>
				</Providers>
			</body>
		</html>
	);
}

