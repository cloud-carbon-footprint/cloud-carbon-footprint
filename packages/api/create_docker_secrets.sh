#!/bin/bash
#
# © 2023 Thoughtworks, Inc.
#
echo "Creating docker secrets from .env file"

if [ ! -d $HOME/.docker/secrets ]; then
  mkdir -p $HOME/.docker/secrets;
fi

while read line; do
  keyValue=(${line//=/ })
  key=${keyValue[0]}
  value=${keyValue[1]}

  # skip commented out variables
  [[ -z $key || $key == \#* ]] && continue

  echo $value > $HOME/.docker/secrets/$key
done < .env
