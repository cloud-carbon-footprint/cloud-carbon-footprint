#!/bin/bash
#
# © 2022 Thoughtworks, Inc.
# 

copyright="© 202[1-3] Thoughtworks, Inc."
errorCode=0
domain=`git config user.email`

if [[ "$domain" != *"thoughtworks.com"* ]]; then echo "Thank you for contributing!";
else
  git diff --cached --name-status | while read x file; do
    if [ "$x" = 'D' ]; then continue; fi
    if [ ${x::1} = 'R' ]; then continue; fi
    if [[ $file = *"CHANGELOG"* ]]; then continue; fi
    if [[ $file = *".changeset"* ]]; then continue; fi
    if [[ $file = *"microsite/"* ]]; then continue; fi
    if [[ $file = *".adr/"* ]]; then continue; fi
    holder=$(echo $file | grep -E "^.*\.(ts|tsx|js|jsx|md|sh)$" | wc -l)
    if [ $holder -eq 0 ]; then continue; fi
    if grep -E "$copyright" $file; then continue; fi

    echo "ERROR: \"$copyright\" not in file: ${file}"
    exit 1
  done || exit 1
fi
