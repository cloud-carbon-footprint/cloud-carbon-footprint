terraform {
  backend "local" {}
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.tags
  }
}

locals {
  base_name = "${var.project_name}-${terraform.workspace}"
  tags = merge(var.default_tags, {
    Project   = local.base_name
    Workspace = terraform.workspace
  })
  subnets = [
    "a",
    "b"
  ]
  dns_name = "ccf.example.com"
}

module "ccf_tool" {
  source = "../.."

  prefix           = local.base_name
  application_port = 8080
  ccf_git_branch   = "trunk"

  vpc_id          = aws_vpc.main.id
  is_private      = true
  private_subnets = values(aws_subnet.private)[*].id

  aws_billing_account_id   = var.aws_billing_account_id
  aws_billing_account_name = var.aws_billing_account_name
  billing_data_bucket      = var.billing_data_bucket

  athena_region               = data.aws_region.main.name
  athena_db_name              = var.athena_db_name
  athena_db_table             = var.athena_db_table
  athena_query_results_bucket = var.athena_query_results_bucket

  public_keys                = []
  enable_ssm_session_manager = true
}
