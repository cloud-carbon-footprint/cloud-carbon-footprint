FROM node:18-alpine as build
WORKDIR /app
COPY ./package.json ./package.json
COPY ./dist /app/build

RUN yarn install --immutable

FROM nginx:stable-alpine
COPY --from=build /app/build /var/www
CMD ["nginx", "-g", "daemon off;"]
