#!/bin/bash

echo "Updating Create-app..."
cd scripts
ts-node test-create-app.ts || exit 1
echo "Installing updated workspaces..."
cd ../../..
yarn install || exit 1
cd packages/create-app
echo "Building..."
npm run build || exit 1
echo "Login..."
npm login || exit 1
echo "Publishing..."
npm publish || exit 1
git checkout package.json
echo "Installing new app..."
npx @cloud-carbon-footprint/create-app-dev || exit 1
echo "Starting app..."
cd ccf-app
yarn start-with-mock-data || exit 1
