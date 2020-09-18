#!/usr/bin/env sh
set -e
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
    export GOOGLE_OAUTH_ACCESS_TOKEN=$(gcloud auth print-access-token)
    rm -rf .terraform
    terraform init -backend-config=vars/backend.hcl
    terraform $subcommand -var-file=vars/config.tfvars
    ;;

  validate)
    terraform validate
    ;;
  *)
    echo "plan and apply are the only acceptable subcommands"
    exit 1
    ;;
esac