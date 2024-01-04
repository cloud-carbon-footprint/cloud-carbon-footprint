#!/usr/bin/env sh

#
# © 2021 Thoughtworks, Inc.
#

# Independently deploys the CCF API to App Engine. Useful for local or simple CI workflows.
set -x

# Create temp directory and copy files
mkdir ./deploy-app
cd packages/api
yarn build
cp -r ./* .././../deploy-app

# Go to temp directory and init yarn with dependencies
cd ../../deploy-app
touch yarn.lock
yarn set version 1.22.21 
yarn install --production

# Deploy to App Engine
gcloud --quiet app deploy

# Remove temp directory
cd ../
rm -rf deploy-app
