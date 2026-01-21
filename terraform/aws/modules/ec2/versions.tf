terraform {
  required_version = ">= 1.1"

  required_providers {
    aws = {
      version = ">= 4.0"
      source  = "hashicorp/aws"
    }
  }
}
