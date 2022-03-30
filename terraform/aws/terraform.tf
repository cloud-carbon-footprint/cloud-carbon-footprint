terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.27"
    }
  }

  backend "s3" {
    bucket = "YOUR-TERRAFORM-STATE-BUCKET-NAME"
    key    = "terraform.tfstate"
    region = "YOUR-DEFAULT-AWS-REGION"
  }

  required_version = ">= 0.14.9"
}
