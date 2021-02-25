FROM node:12-alpine

WORKDIR /app

COPY ./package.json ./package.json
COPY ./index.js ./index.js
COPY ./.env ./.env
COPY ./build /app/build

RUN yarn install --immutable

CMD ["yarn", "start"]
