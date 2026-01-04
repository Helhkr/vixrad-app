import { ReportEditor } from "@/features/reports/ReportEditor";

export default function HomePage() {
	return (
		<main>
			<h1>Vixrad</h1>
			<p>Editor de laudos estruturados (estado volátil; sem armazenamento local).</p>
			<ReportEditor />
		</main>
	);
}

