#!/bin/bash

user=ec2-user

# Setup public keys
mkdir -p "/home/$user/.ssh"
touch "/home/$user/.ssh/authorized_keys"
%{ for public_key in public_keys ~}
echo "${public_key}" >> "/home/$user/.ssh/authorized_keys"
%{ endfor ~}
chown "$user": "/home/$user/.ssh/authorized_keys"
chmod 0600 "/home/$user/.ssh/authorized_keys"

# Install dependencies (git, node, yarn, jq)
yum update -y
yum install -y git curl jq
curl --silent --location https://rpm.nodesource.com/setup_14.x | bash -
yum install -y nodejs
curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo
rpm --import https://dl.yarnpkg.com/rpm/pubkey.gpg
yum install -y yarn

# Clone CCF repository and install dependencies
su - "$user"
cd "/home/$user"
git clone --branch "${ccf_git_branch}" https://github.com/cloud-carbon-footprint/cloud-carbon-footprint.git
cd cloud-carbon-footprint/
yarn install

# Set env variables for Node API
cd packages/api
cp .env.template .env

sed -i '23,48d' .env
sed -i '17,18d' .env
sed -i 's/your-target-account-role-name (e.g. ccf-app)/${target_account_role_name}/g' .env
sed -i 's/your-athena-db-name/${athena_db_name}/g' .env
sed -i 's/your-athena-db-table/${athena_db_table}/g' .env
sed -i 's/your-athena-region/${athena_region}/g' .env
sed -i 's/your-athena-query-results-location/${athena_results_bucket_name}/g' .env
sed -i 's/your-billing-account-id/${aws_billing_account_id}/g' .env
sed -i 's/your-billing-account-name/${aws_billing_account_name}/g' .env
sed -i 's/AWS_AUTH_MODE=default/AWS_AUTH_MODE=${auth_mode}/g' .env

cd ../..

# Set env variables for React client
cd packages/client
cp .env.template .env

sed -i 's/REACT_APP_PREVIOUS_YEAR_OF_USAGE/#REACT_APP_PREVIOUS_YEAR_OF_USAGE/g' .env
sed -i 's/=2/=12/g' .env

cat <<EOF >> .env
HOST=${client_host}
PORT=${client_port}
EOF

# Start CCF application (client and API)
cd "/home/$user/cloud-carbon-footprint"
yarn start &
