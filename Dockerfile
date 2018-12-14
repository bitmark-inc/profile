FROM node:8-alpine AS build-server

COPY server /build-server
WORKDIR /build-server

RUN apk --no-cache --virtual build-dependencies add \
    python \
    make \
    g++ \
    && npm install \
    && apk del build-dependencies

RUN npm install

FROM node:8-alpine

COPY --from=build-server /build-server /app

RUN apk --no-cache --virtual build-dependencies add \
    ca-certificates \
    && apk del build-dependencies

RUN mkdir -p /var/log/profiles

COPY ./server/src/configs/local.conf.json /.config/profiles-conf.json

ENV BITMARK_CONFIGURATION /.config/profiles-conf.json
ENV PROJ_HOME /app

WORKDIR /app

EXPOSE 1102

CMD [ "npm", "start"]
