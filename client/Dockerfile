FROM node:12-alpine

WORKDIR /app

COPY ./static-server/package.json ./package.json
COPY ./static-server/package-lock.json ./package-lock.json
COPY ./static-server/index.js ./index.js
COPY ./build /app/build

RUN npm ci

CMD ["npm", "start"]
