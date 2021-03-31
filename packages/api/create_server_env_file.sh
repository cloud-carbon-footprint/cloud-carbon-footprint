#!/usr/bin/env sh

#
# © 2020 ThoughtWorks, Inc. All rights reserved.
#

echo AWS_PROXY_ACCOUNT_ID=$AWS_PROXY_ACCOUNT_ID >> .env
echo AWS_PROXY_ROLE_NAME=$AWS_PROXY_ROLE_NAME >> .env
echo AWS_ACCOUNTS=$AWS_ACCOUNTS >> .env
echo AWS_TARGET_ACCOUNT_ROLE_NAME=$AWS_TARGET_ACCOUNT_ROLE_NAME >> .env
echo AWS_AUTH_MODE=$AWS_AUTH_MODE >> .env
echo AWS_ATHENA_REGION=$AWS_ATHENA_REGION >> .env
echo AWS_ATHENA_DB_NAME=$AWS_ATHENA_DB_NAME >> .env
echo AWS_ATHENA_DB_TABLE=$AWS_ATHENA_DB_TABLE >> .env
echo AWS_ATHENA_QUERY_RESULT_LOCATION=$AWS_ATHENA_QUERY_RESULT_LOCATION >> .env
echo AWS_BILLING_ACCOUNT_ID=$AWS_BILLING_ACCOUNT_ID >> .env
echo AWS_BILLING_ACCOUNT_NAME=$AWS_BILLING_ACCOUNT_NAME >> .env
echo AWS_USE_BILLING_DATA="true" >> .env
echo GCP_USE_BILLING_DATA="true" >> .env
echo GCP_PROJECTS=$GCP_PROJECTS >> .env
echo GCP_BIG_QUERY_TABLE=$GCP_BIG_QUERY_TABLE >> .env
echo GCP_BILLING_ACCOUNT_ID=$GCP_BILLING_ACCOUNT_ID >> .env
echo GCP_BILLING_ACCOUNT_NAME=$GCP_BILLING_ACCOUNT_NAME >> .env
echo LOGGING_MODE="GCP" >> .env
echo GENERATE_SOURCEMAP="false" >> .env
