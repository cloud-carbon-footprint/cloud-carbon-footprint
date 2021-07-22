#!/bin/bash

#
# © 2021 Thoughtworks, Inc.
#

if [ ! -d $HOME/.docker/secrets ]; then
  mkdir -p $HOME/.docker/secrets;
fi

while read line; do
  keyValue=(${line//=/ })
  key=${keyValue[0]}
  value=${keyValue[1]}
  echo $value > $HOME/.docker/secrets/$key
done <.env
