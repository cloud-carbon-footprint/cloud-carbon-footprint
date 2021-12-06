#!/bin/sh

#
# © 2021 Thoughtworks, Inc.
#
new_remote=$1
new_branch=$2
new_local_branch="$new_remote/$new_branch"

git remote add $new_remote "git@github.com:$new_remote/cloud-carbon-footprint.git"
git fetch $new_remote
git checkout --track -B $new_local_branch $new_local_branch
