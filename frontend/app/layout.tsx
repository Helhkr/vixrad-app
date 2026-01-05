import type { ReactNode } from "react";
import Providers from "./providers";

export const metadata = {
	title: "Vixrad",
	description: "Editor de laudos estruturados (sem persistência de conteúdo clínico)."
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="pt-BR">
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}

