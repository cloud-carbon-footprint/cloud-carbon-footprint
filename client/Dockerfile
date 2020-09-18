FROM nginx:1.19-alpine

COPY ./build /data/www

# requires SERVER_HOST and SERVER_PORT to be provided as env vars when container is run
COPY ccf.conf.template /etc/nginx/templates/ccf.conf.template