FROM node:12-alpine
WORKDIR /usr/src/app
RUN apk add --no-cache --virtual .build-deps g++ python3-dev libffi-dev openssl-dev git && \
    apk add --no-cache --update python3 && \
    apk --no-cache --update add build-base

COPY ./dist .
RUN npm ci

CMD [ "npm", "run", "start:prod"]