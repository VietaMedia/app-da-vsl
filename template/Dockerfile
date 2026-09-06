# Imagem do app. Multi-stage:
# ATENCAO: a pasta de trabalho NAO pode ser /app. O projeto tem uma rota chamada "app"
# (app/app/...), e com WORKDIR /app o Next standalone confunde os caminhos e TODA rota
# passa a redirecionar pra /entrar (achado em 2026-09-06). Por isso /srv/site.
# instala, compila, e a imagem final leva só o
# standalone do Next (server.js + o que ele precisa), sem node_modules inteiro.
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /srv/site
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /srv/site
COPY --from=deps /srv/site/node_modules ./node_modules
COPY . .
# prisma generate precisa da variavel definida, mas nao conecta em nada no build
ENV DATABASE_URL="mysql://build:build@127.0.0.1:3306/build"
RUN npm run icones
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache openssl wget
WORKDIR /srv/site
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# pos-build.mjs ja copiou public/ e .next/static para dentro do standalone
COPY --from=builder /srv/site/.next/standalone ./
RUN addgroup -g 1001 -S app && adduser -S app -u 1001 && chown -R app:app /srv/site
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "server.js"]
