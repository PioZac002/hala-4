# Hala 4 in one image: the built page and the answer desk served by a single Node process.
#
#   docker compose up --build        (see docker-compose.yml, reads .env)
#
# Stage 1 installs and builds; stage 2 keeps only what runs — the static site, the bundled
# server and nothing else. No node_modules in the final image, so it stays small.

FROM node:24-alpine AS build
WORKDIR /app

# Dependencies first: this layer is rebuilt only when the lockfile changes.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build:all

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# No PORT here on purpose: the server defaults to 8080 and a platform that injects its own
# PORT (Render, Cloud Run, Fly) must win. EXPOSE stays as the hint for local runs.

COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server

# The server writes no files and needs no shell; run it as the image's own unprivileged user.
USER node
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8080)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist-server/serve.mjs"]
