terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.27"
    }
  }

  backend "s3" {
    bucket = var.terraform_state_bucket
    key    = "terraform.tfstate"
    region = var.default_region
  }

  required_version = ">= 0.14.9"
}
