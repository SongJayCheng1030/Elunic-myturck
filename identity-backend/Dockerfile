FROM node:14-alpine3.12 AS builder
ARG BUILD_ENVIRONMENT

WORKDIR /app/
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm i --unsafe
COPY ./shared/ /app/shared/

WORKDIR /app/identity-backend/
COPY ./identity-backend/package.json ./package.json
COPY ./identity-backend/package-lock.json ./package-lock.json
RUN npm i --unsafe
COPY ./identity-backend/ ./

RUN npm run "compile:${BUILD_ENVIRONMENT}"


##
FROM node:14-alpine3.12 AS aggregator

RUN mkdir /app/ \
  && mkdir /app/__root/ \
  && mkdir /app/identity-backend/

WORKDIR /app/__root/
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm ci --unsafe --production

WORKDIR /app/identity-backend/
COPY ./identity-backend/package.json ./package.json
COPY ./identity-backend/package-lock.json ./package-lock.json
RUN npm ci --unsafe --production
COPY --from=builder /app/identity-backend/build/ ./build/


##
FROM node:14-alpine3.12

RUN apk add curl

ARG BUILD_ENVIRONMENT

# This places the shared root modules in a separate layer to enable it to be
# shared among all images
COPY --from=aggregator --chown=node /app/__root/ /app/
COPY --from=aggregator --chown=node /app/identity-backend/ /app/identity-backend/

WORKDIR /app/identity-backend/
USER node

VOLUME ["/data"]
EXPOSE 8080

ENV BUILD_ENVIRONMENT ${BUILD_ENVIRONMENT}
CMD npm run "start:${BUILD_ENVIRONMENT}"
