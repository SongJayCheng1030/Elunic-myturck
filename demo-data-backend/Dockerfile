# --- Builder image
FROM node:18-alpine AS builder
ARG BUILD_ENVIRONMENT

WORKDIR /app/

COPY ./demo-data-backend/ /app/
RUN npm i && \
  npm run "compile:${BUILD_ENVIRONMENT}"

# --- Aggregator image
FROM node:18-alpine AS aggr
ARG BUILD_ENVIRONMENT

WORKDIR /app

COPY --chown=node --from=builder /app/package.json /app/package.json
COPY --chown=node --from=builder /app/package-lock.json /app/package-lock.json
COPY --chown=node --from=builder /app/build /app/build
COPY --chown=node --from=builder /app/node_modules /app/node_modules

RUN npm prune --omit=dev --omit=optional --omit=peer

RUN wget https://github.com/tj/node-prune/releases/download/v1.0.1/node-prune_1.0.1_linux_amd64.tar.gz && \
  tar xvf node-prune_1.0.1_linux_amd64.tar.gz && \
  ./node-prune

# --- Final image
FROM node:18-alpine

USER node
WORKDIR /app
COPY --chown=node --from=aggr /app/ /app/

EXPOSE 8080

CMD npm run "start:production"