FROM oven/bun:1-slim AS base
WORKDIR /app

# Install dependencies
FROM base AS install
RUN mkdir -p /temp/prod
COPY package.json bun.lock bunfig.toml /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Copy node_modules and project files
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY . .

USER bun
EXPOSE 3000/tcp

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=localhost

CMD ["bun", "start"]
