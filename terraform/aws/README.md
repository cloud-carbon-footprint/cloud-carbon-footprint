# CCF Infrastructure Setup (AWS/Terraform)

## Overview

This directory contains basic infrastructure code to set up the application in AWS.

There are a few ways to deploy this module:
- via AWS EC2
- via AWS ECS

## EC2 Module

Please find [the readme for the AWS EC2 module here.](modules/ec2/README.md)

### Example usage

```terraform
module "ccf_ec2" {
  source = "github.com/cloud-carbon-footprint/cloud-carbon-footprint//terraform/aws/modules/ec2"

  prefix                      = "ccf-ec2"
  application_port            = 8080
  vpc_id                      = aws_vpc.main.id
  is_private                  = true
  private_subnets             = [aws_subnet.private.id]
  aws_billing_account_id      = var.aws_billing_account_id
  aws_billing_account_name    = var.aws_billing_account_name
  billing_data_bucket         = var.billing_data_bucket
  athena_region               = data.aws_region.main.name
  athena_db_name              = var.athena_db_name
  athena_db_table             = var.athena_db_table
  athena_query_results_bucket = var.athena_query_results_bucket
  ccf_git_branch              = "trunk"
  public_keys                 = []
  enable_ssm_session_manager  = true
}
```

## ECS Module

Please find [the readme for the AWS ECS module here.](modules/ecs/README.md)

### Example usage

```terraform
module "ccf_ecs" {
  source = "github.com/cloud-carbon-footprint/cloud-carbon-footprint//terraform/aws/modules/ecs"

  prefix                      = "ccf-ecs"
  vpc_id                      = aws_vpc.main.id
  is_private                  = true
  private_subnets             = [aws_subnet.private.id]
  public_subnets              = []
  athena_db_name              = var.athena_db_name
  athena_db_table             = var.athena_db_table
  athena_query_results_bucket = var.athena_query_results_bucket
  athena_region               = data.aws_region.main.name
  aws_billing_account_id      = var.aws_billing_account_id
  aws_billing_account_name    = var.aws_billing_account_name
  billing_data_bucket         = var.billing_data_bucket
  ccf_client_version          = "release-2022-08-02"
}
```

© 2022 Thoughtworks, Inc.
