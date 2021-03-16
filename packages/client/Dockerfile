FROM node:12-alpine

WORKDIR /app

COPY ./package.json ./package.json
COPY ./index.js ./index.js
COPY ./.env ./.env
COPY .npmrc .npmrc
COPY ./build /app/build

RUN yarn install --immutable
RUN rm -f .npmrc

CMD ["yarn", "start:webprod"]
