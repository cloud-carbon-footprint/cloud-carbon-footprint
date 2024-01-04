#!/usr/bin/env sh

#
# © 2024 Thoughtworks, Inc.
#

# Independently deploys the CCF API to App Engine. Useful for local or simple CI workflows.

# Check if script is run from root directory
if [ ! -f src/api.ts ]; then
  echo "Error: Script must be run from the API directory. (packages/api)"
  exit 1
fi

# Create temp directory and copy files
echo "Creating temp directory and copying files..."
DEPLOY_DIR=$(realpath ../../deploy-app)
mkdir "$DEPLOY_DIR"
# Setup cleanup for directory on exit/interruption
trap 'echo "Cleaning up temp directory..." && rm -rf "$DEPLOY_DIR"' EXIT INT

yarn build
cp -r ./* ../../deploy-app
cp .env ../../deploy-app

# Copy Google Applications Credentials
if grep -q "GOOGLE_APPLICATION_CREDENTIALS" .env; then
  echo "Copying Google Application Credentials..."
  GOOGLE_APPLICATION_CREDENTIALS=$(grep -m 1 "^[^#]*GOOGLE_APPLICATION_CREDENTIALS" .env | cut -d '=' -f2)
  cp "$GOOGLE_APPLICATION_CREDENTIALS" ../../deploy-app
  GOOGLE_APPLICATION_CREDENTIALS_FILENAME=$(basename "$GOOGLE_APPLICATION_CREDENTIALS")
  sed -i "s|GOOGLE_APPLICATION_CREDENTIALS=.*|GOOGLE_APPLICATION_CREDENTIALS=./$GOOGLE_APPLICATION_CREDENTIALS_FILENAME|" ../../deploy-app/.env
fi


# Go to temp directory and init yarn with dependencies
echo "Initializing yarn with dependencies..."
cd ../../deploy-app
touch yarn.lock
yarn set version 1.22.21 
yarn install --production

# Deploy to App Engine
echo "Deploying to App Engine..."
gcloud --quiet app deploy

# Remove temp directory
echo "Cleaning up temp directory..."
cd ../
rm -rf deploy-app

echo "Done!"
exit 0