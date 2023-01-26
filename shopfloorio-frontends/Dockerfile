# ---
# Builder
# ---
FROM node:14-alpine AS builder
ARG APP_NAME

WORKDIR /app/

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json

RUN npm i
COPY ./ ./

RUN npm run "build:${APP_NAME}"

RUN mv /app/dist/${APP_NAME} /app/dist/app

# ---
# Prometheus image
# ---
FROM nginx/nginx-prometheus-exporter:latest AS exporter

# ---
# Final image
# ---
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/* && rm -rf /etc/nginx/conf.d/*

COPY ./docker/default.conf /etc/nginx/conf.d/default.conf
COPY ./docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

COPY --from=builder /app/dist/app /usr/share/nginx/html
COPY --from=exporter /usr/bin/nginx-prometheus-exporter /usr/bin/nginx-prometheus-exporter

# -------------------------------------------------
# IMPORTANT: please change those two values only together and don't
# forget to change also the 'default.conf' port definition!
# -------------------------------------------------
EXPOSE 80
ENV NGINX_PORT=80
# -------------------------------------------------

CMD ["/bin/sh", "/docker-entrypoint.sh"]
