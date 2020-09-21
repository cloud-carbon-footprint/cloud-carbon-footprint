#!/bin/bash

token=$(curl -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=potato&format=full)
aws sts assume-role-with-web-identity --role-arn arn:aws:iam::921261756131:role/GCPServiceAccount --role-session-name gcp --web-identity-token $token > sts.json

access_key_id=$(cat sts.json | jq -r .Credentials.AccessKeyId)
SecretAccessKey=$(cat sts.json | jq -r .Credentials.SecretAccessKey)
SessionToken=$(cat sts.json | jq -r .Credentials.SessionToken)

mkdir /root/.aws

cat << EOF > /root/.aws/credentials
[default]
aws_access_key_id = $access_key_id
aws_secret_access_key = $SecretAccessKey
aws_session_token = $SessionToken
EOF

gcloud auth configure-docker -q

cat << COMPOSE > docker-compose.yml
version: "3.7"
 
services:
  server:
    image: gcr.io/cloud-carbon-footprint/server:0.0.1
    ports:
      - "4000:4000"
    volumes:
      - /root/.aws/credentials:/root/.aws/credentials
  client:
    image: gcr.io/cloud-carbon-footprint/client:0.0.1
    ports:
      - "8080:8080"
    environment: 
      SERVER_HOST: server
      SERVER_PORT: 4000
    links: 
      - "server"

COMPOSE

    /usr/bin/env docker-compose up -d