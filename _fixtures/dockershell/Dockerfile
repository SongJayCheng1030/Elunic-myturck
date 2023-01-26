# buster is required to have a correct minimum Git version for husky
ARG NODE_VERSION
FROM node:${NODE_VERSION}-buster

ENV PATH /app/node_modules/.bin:$PATH

RUN mkdir /app \
  && chown -R node:node /app

RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && apt-get update \
    && apt-get install -yq chromium \
    && apt-get install -yq jq nano bash-completion \
    && npm completion > /etc/bash_completion.d/npm

ARG NPM_VERSION
ARG NG_VERSION
ARG NESTJS_VERSION
RUN npm install -g "npm@^${NPM_VERSION}" \
    && npm install -g "@angular/cli@^${NG_VERSION}" "@nestjs/cli@^${NESTJS_VERSION}"

WORKDIR /app
