events {
}

http {
    server {
        listen ${client_port};
        include /etc/nginx/mime.types;
        root /var/www;
        index index.html index.htm;
        location / {
            try_files $uri $uri/ =404;
        }
    }
}
