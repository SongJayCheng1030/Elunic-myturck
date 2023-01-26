FROM node:14-alpine AS builder

WORKDIR /app/
COPY ./docs/package.json ./package.json
COPY ./docs/package-lock.json ./package-lock.json
RUN npm i --unsafe
COPY ./docs/ ./

RUN npm run build


## Final image
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY ./docs/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 8080

CMD ["/bin/sh", "-c", "exec nginx -g 'daemon off;'"]
