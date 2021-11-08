terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.27"
    }
  }

  backend "s3" {
    bucket = "cloudcarbonfootprint-terraform"
    key    = "terraform.tfstate"
    region = "YOUR-AWS-DEFAULT-REGION"
  }

  required_version = ">= 0.14.9"
}