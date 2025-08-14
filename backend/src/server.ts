console.log('1. Iniciando server.ts...');

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.ts';
import templateRoutes from './routes/template.routes.ts';

console.log('2. Imports do server.ts concluídos.'); // Adicione após os imports

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});