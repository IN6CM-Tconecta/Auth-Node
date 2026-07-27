# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — deps
# Instala SOLO las dependencias de producción con npm ci para un resultado
# determinístico y reproducible (equivalente a 'dotnet restore' del .NET).
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

# Instalar dependencias de sistema necesarias para paquetes nativos de pg
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar manifiestos primero para aprovechar la caché de capas de Docker.
# Si package.json y package-lock.json no cambian, npm ci no vuelve a ejecutarse.
COPY package.json package-lock.json ./

RUN npm ci --omit=dev

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — runner (imagen final mínima)
# Solo contiene el código fuente y las dependencias de producción.
# Sin devDependencies, sin caché de npm, sin código de build innecesario.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

# Metadata de la imagen
LABEL maintainer="TransmetroConecta DevOps"
LABEL description="Auth-Node — Servicio de autenticación de TransmetroConecta"
LABEL version="1.0.0"

# Instalar dependencias de sistema mínimas para pg
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Crear usuario no-root para ejecutar la aplicación (hardening de seguridad)
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 authnode

# Copiar node_modules desde la stage de deps (solo producción)
COPY --from=deps --chown=authnode:nodejs /app/node_modules ./node_modules

# Copiar código fuente del servicio
COPY --chown=authnode:nodejs index.js        ./
COPY --chown=authnode:nodejs package.json    ./
COPY --chown=authnode:nodejs configs/        ./configs/
COPY --chown=authnode:nodejs helpers/        ./helpers/
COPY --chown=authnode:nodejs middlewares/    ./middlewares/
COPY --chown=authnode:nodejs models/         ./models/
COPY --chown=authnode:nodejs src/            ./src/

# Cambiar al usuario sin privilegios
USER authnode

# Puerto del servicio (mismo que usaba auth-server en Docker Compose: 8080)
EXPOSE 8080

# Healthcheck interno del contenedor
# Verifica que el endpoint /api/health responda 200 cada 30s
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/health || exit 1

# Comando de inicio en modo producción
# Usamos node directamente (sin npm) para que las señales SIGTERM/SIGINT
# lleguen directamente al proceso Node, permitiendo graceful shutdown.
CMD ["node", "index.js"]
