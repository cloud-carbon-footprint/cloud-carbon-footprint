#!/bin/sh

#
# © 2021 Thoughtworks, Inc.
#

#Intended to be executed from project root directory
templatePath="packages/create-app/templates/default-app/packages/$1"
targetPath="packages/$1/src"

if [ -d $templatePath ]
then
    cp -r $targetPath $templatePath
    cd "$templatePath/src"
    find . -name "*.test.tsx" -type f -delete
    find . -name "*.test.tsx.snap" -type f -delete
    find . -name "*.test.ts" -type f -delete
    echo -e "Successfully copied files from [$1] package into $templatePath.\nMake sure to double check before committing! :D"
else
    echo "Error: Directory \"$templatePath\" does not exists. Please specify an appropriate template package."
    exit 1
fi

#git diff --cached --name-status | while read x file; do
#  cp $file "\"$templatePath\"/src"
# done
