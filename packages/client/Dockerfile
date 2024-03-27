FROM node:18-alpine as build
WORKDIR /app
COPY ./package.json ./package.json
COPY ./build /app/build

RUN yarn install --immutable

FROM nginxinc/nginx-unprivileged:1.25
COPY --from=build /app/build /var/www
CMD ["nginx", "-g", "daemon off;"]
