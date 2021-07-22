#!/bin/sh

#
# © 2021 Thoughtworks, Inc.
#

branch="$(git rev-parse --abbrev-ref HEAD)"

if [[ "$branch" != "trunk" ]]; then
    read -p "Are you sure you want to use a branch that isn't trunk? (y/n): " -n 1 -r < /dev/tty
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Okie dokie. Be Careful out there :)"
        exit 0
    fi

    echo "Commit aborted. Head on back to the trunk :)"
    exit 1
fi
