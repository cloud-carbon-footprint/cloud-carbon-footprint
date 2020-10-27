FROM node:12-alpine

WORKDIR /app

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
COPY ./index.js ./index.js
COPY ./.env ./.env
COPY ./build /app/build

RUN npm ci

CMD ["npm", "start"]
