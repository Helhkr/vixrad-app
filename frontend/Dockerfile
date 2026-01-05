FROM node:20-alpine

WORKDIR /app

# Install deps first (cached when package files unchanged)
COPY frontend/package.json frontend/package-lock.json ./frontend/
WORKDIR /app/frontend
RUN npm ci

# Copy app source
WORKDIR /app
COPY frontend ./frontend

# Build-time public env for client bundle
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

WORKDIR /app/frontend
RUN npm run build

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "run", "start", "--", "-p", "3000", "-H", "0.0.0.0"]
