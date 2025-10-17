FROM node:20-bookworm-slim AS deps
WORKDIR /app
ENV NODE_ENV=development
COPY package*.json ./
RUN npm ci

FROM node:20-bookworm-slim AS builder
WORKDIR /app
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only the production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Bring in the compiled application
COPY --from=builder /app/dist ./dist

# Include any runtime configuration or assets needed at runtime
COPY --from=builder /app/config ./config
COPY --from=builder /app/.sequelizerc ./.sequelizerc

# Set the port that the app expects; overridable at runtime
ENV SERVER_PORT=3000
EXPOSE 3000

CMD ["npm", "run", "start"]
