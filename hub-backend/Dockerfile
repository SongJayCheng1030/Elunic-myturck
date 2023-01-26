FROM node:14-alpine AS builder
ARG BUILD_ENVIRONMENT

WORKDIR /app/
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm i --unsafe
COPY ./shared/ /app/shared/

WORKDIR /app/hub-backend/
COPY ./hub-backend/package.json ./package.json
COPY ./hub-backend/package-lock.json ./package-lock.json
RUN npm i --unsafe
COPY ./hub-backend/ ./

RUN npm run "compile:${BUILD_ENVIRONMENT}"


##
FROM node:14-alpine AS aggregator

RUN mkdir /app/ \
  && mkdir /app/__root/ \
  && mkdir /app/hub-backend/

WORKDIR /app/__root/
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm ci --unsafe --production

WORKDIR /app/hub-backend/
COPY ./hub-backend/package.json ./package.json
COPY ./hub-backend/package-lock.json ./package-lock.json
RUN npm ci --unsafe --production
COPY --from=builder /app/hub-backend/build/ ./build/


##
FROM node:14-alpine

RUN apk add curl


ARG BUILD_ENVIRONMENT

# This places the shared root modules in a separate layer to enable it to be
# shared among all images
COPY --from=aggregator --chown=node /app/__root/ /app/
COPY --from=aggregator --chown=node /app/hub-backend/ /app/hub-backend/

WORKDIR /app/hub-backend/
USER node

VOLUME ["/data"]
EXPOSE 8080

ENV BUILD_ENVIRONMENT ${BUILD_ENVIRONMENT}
CMD npm run "start:${BUILD_ENVIRONMENT}"
