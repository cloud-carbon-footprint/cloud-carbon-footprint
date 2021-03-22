FROM node:14-alpine
WORKDIR /usr/src/app
COPY ./dist ./dist
ARG NPM_TOKEN
COPY .npmrc .npmrc
COPY ./package.json .
RUN yarn install --immutable
RUN rm -f .npmrc
RUN rm -rf core

CMD [ "yarn", "start:webprod"]
