#!/bin/sh

#
# © 2021 Thoughtworks, Inc.
#

#Intended to be executed from project root directory
targetTemplatePath="packages/create-app/templates/default-app/packages/$1"
sourcePath="packages/$1/src"

if [ -d $targetTemplatePath ]
then
    cp -r $sourcePath $targetTemplatePath
    cd "$targetTemplatePath/src"
    find . -name "*.test.ts*" -type f -delete
    find . -type d -name '*__tests__*' -prune -print -exec rm -rf {} +
    echo "Successfully copied files from [$1] package into $targetTemplatePath.\nMake sure to double check before committing! :D"
    exit 0
else
    echo "Error: Directory \"$targetTemplatePath\" does not exists. Please specify an appropriate template package."
    exit 1
fi