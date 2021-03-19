FROM node:14-alpine as build
WORKDIR /app
COPY ./package.json ./package.json
COPY .npmrc .npmrc
COPY ./build /app/build

RUN yarn install --immutable
RUN rm -f .npmrc

FROM nginx:stable-alpine
COPY --from=build /app/build /var/www
CMD ["nginx", "-g", "daemon off;"]
