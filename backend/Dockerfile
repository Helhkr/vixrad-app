FROM node:20-alpine

WORKDIR /app

# Install deps first (cached when package files unchanged)
COPY backend/package.json backend/package-lock.json ./backend/
WORKDIR /app/backend
RUN npm ci

# Copy source + prisma + scripts
WORKDIR /app
COPY backend/tsconfig.json backend/tsconfig.build.json backend/jest.config.cjs ./backend/
COPY backend/prisma ./backend/prisma
COPY backend/src ./backend/src
COPY backend/scripts ./backend/scripts

# Copy clinical templates docs so TemplatesService can resolve ../docs/clinical/ct
COPY docs ./docs

WORKDIR /app/backend
RUN npx prisma generate
RUN npm run build

ENV PORT=3001
EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
