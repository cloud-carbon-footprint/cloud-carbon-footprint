#!/usr/bin/env bash

set -e
set +x

PINK='\033[38;5;165m'
GREEN='\033[38;5;34m'
NONE='\033[0m'

log() {
  awk -v c=$1 -v n=$NONE -v l=$2 '{print c l " " n $0}'
}

pushd client
npm run start | log $PINK "[CLIENT]"  &
popd

pushd server
npm run start:web | log $GREEN "[SERVER]"
popd
