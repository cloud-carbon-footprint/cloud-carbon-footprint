#!/bin/bash
#
# © 2023 Thoughtworks, Inc.
#
echo "Creating docker secrets"

# Ensure that the secrets directory exists
if [ ! -d $HOME/.docker/secrets ]; then
  mkdir -p $HOME/.docker/secrets;
fi

# Create dummy secrets entries for all secrets in docker-compose.yml
# later we fill these entries with values from .env file. Otherwise
# docker-compose will complain about missing secrets.
inside_secrets=0
while IFS= read -r line; do
    if [[ $line == "secrets:"* ]]; then
        inside_secrets=1
    elif [[ $line == " "* ]]; then # line is a value
        if (( inside_secrets )); then
            key=$(echo "$line" | awk -F: '{print $1}' | sed 's/^[ \t]*//;s/[ \t]*$//')
            [[ ${key} == "file" ]] && continue # skip 'file:' entries
            touch $HOME/.docker/secrets/$key
        fi
    else
        inside_secrets=0
    fi
done < ../../docker-compose.yml

# Fill secrets with values from .env file
while read line; do
  keyValue=(${line//=/ })
  key=${keyValue[0]}
  value=${keyValue[1]}

  # skip commented out variables
  [[ -z $key || $key == \#* ]] && continue

  echo $value > $HOME/.docker/secrets/$key
done < .env
