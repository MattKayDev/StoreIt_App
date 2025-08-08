# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app

# ---- Dependencies ----
FROM base AS dependencies
COPY package.json ./
RUN npm install --frozen-lockfile

# ---- Build ----
FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- Runner ----
FROM base AS runner
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
