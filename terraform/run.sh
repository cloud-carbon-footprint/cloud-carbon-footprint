#!/usr/bin/env sh
#
# © 2020 ThoughtWorks, Inc. All rights reserved.
#

set -e

auto_approve_flag=""
# Parse options to the `run` command
while getopts ":h" opt; do
  case ${opt} in
    h )
      echo "Usage:"
      echo "    ./run -h                             Display this help message."
      echo "    ./run (plan | apply)                 plan or apply"
      exit 0
      ;;
   \? )
     echo "Invalid Option: -$OPTARG" 1>&2
     exit 1
     ;;
  esac
done
shift $((OPTIND -1))

subcommand=$1; shift  # Remove 'run' from the argument list
case "$subcommand" in
  # Parse options to the install sub command
  plan | apply | destroy)

    if [ $subcommand == "apply" ] || [ $subcommand == "destroy" ]
    then
      auto_approve_flag="--auto-approve"
    fi

    rm -rf .terraform
    export GOOGLE_OAUTH_ACCESS_TOKEN=$(gcloud auth print-access-token)
    terraform init -backend-config=vars/backend.hcl
    terraform $subcommand -var-file=vars/config.tfvars $auto_approve_flag
    ;;

  *)
    echo "plan, apply, and destroy are the only acceptable subcommands"
    exit 1
    ;;
esac