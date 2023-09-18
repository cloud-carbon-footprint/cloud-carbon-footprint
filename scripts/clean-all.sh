#!/usr/bin/env zsh
#
# © 2022 Thoughtworks, Inc
#
cat <<-EOM 
!!!ATENTION!!!

This script will remove all files listed in '.gitignore',
it will effectively restore the repository to its fresh
clone state.

$(git clean -Xdn; git clean -Xn)

!!!ATENTION!!!

EOM

if read -q "c?Press Y/y to confirm or any key to cancel: "; then
    git clean -Xf
    git clean -Xdf
else
    print '\nClean canceled.'
fi
