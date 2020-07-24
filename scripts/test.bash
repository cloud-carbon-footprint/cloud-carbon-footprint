#!/usr/bin/env bash

header() {
  echo -e "\033[38;5;165m\n$1\n\033[0m"
}

set -e
set +x

PACKAGE=${1:-both}

client() {
  header "Client"
  cd client
  npm test
  cd ..
}

server() {
  header "Server"
  cd server
  npm test
  cd ..
}


if [ "$PACKAGE" == "both" ]; then
  client
  server
elif [ "$PACKAGE" == "client" ];then
  client
elif [ "$PACKAGE" == "server" ];then
  server
fi
