#!/bin/bash

#
# © 2020 ThoughtWorks, Inc. All rights reserved.
#

echo AWS_PROXY_ACCOUNT_ID=$AWS_PROXY_ACCOUNT_ID >> .env
echo AWS_PROXY_ROLE_NAME=$AWS_PROXY_ROLE_NAME >> .env
echo AWS_ACCOUNTS=$AWS_ACCOUNTS >> .env
cp .env dist
