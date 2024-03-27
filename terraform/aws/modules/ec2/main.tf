data "aws_region" "main" {}

data "aws_ami" "amazon_linux_2" {
  most_recent = true

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm*"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }

  owners = ["137112412989"] # amazon
}

data "aws_instances" "main" {
  filter {
    name   = "tag:aws:autoscaling:groupName"
    values = [aws_autoscaling_group.ccf.name]
  }
}

data "aws_s3_bucket" "billing_data_bucket" {
  bucket = var.billing_data_bucket
}

data "aws_s3_bucket" "athena_query_results_bucket" {
  bucket = var.athena_query_results_bucket
}

module "ccf_role" {
  source                          = "../ccf_role"
  athena_query_results_bucket_arn = data.aws_s3_bucket.athena_query_results_bucket.arn
  billing_data_bucket_arn         = data.aws_s3_bucket.billing_data_bucket.arn
  prefix                          = var.prefix
  enable_ssm_session_manager      = var.enable_ssm_session_manager
}
