FROM node:14-alpine AS builder
ARG BUILD_ENVIRONMENT

WORKDIR /app/
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm i --unsafe
COPY ./shared/ /app/shared/

WORKDIR /app/maintenance-backend/
COPY ./maintenance-backend/package.json ./package.json
COPY ./maintenance-backend/package-lock.json ./package-lock.json
RUN npm i --unsafe
COPY ./maintenance-backend/ ./

RUN npm run "compile:${BUILD_ENVIRONMENT}"


##
FROM node:14-alpine AS aggregator

RUN mkdir /app/ \
  && mkdir /app/__root/ \
  && mkdir /app/maintenance-backend/

WORKDIR /app/__root/
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm ci --unsafe --production

WORKDIR /app/maintenance-backend/
COPY ./maintenance-backend/package.json ./package.json
COPY ./maintenance-backend/package-lock.json ./package-lock.json
RUN npm ci --unsafe --production
COPY --from=builder /app/maintenance-backend/build/ ./build/


##
FROM node:14-alpine
ARG BUILD_ENVIRONMENT

RUN apk add curl

# This places the shared root modules in a separate layer to enable it to be
# shared among all images
COPY --from=aggregator --chown=node /app/__root/ /app/
COPY --from=aggregator --chown=node /app/maintenance-backend/ /app/maintenance-backend/

WORKDIR /app/maintenance-backend/
USER node

VOLUME ["/data"]
EXPOSE 8080

ENV BUILD_ENVIRONMENT ${BUILD_ENVIRONMENT}
CMD npm run "start:${BUILD_ENVIRONMENT}"
