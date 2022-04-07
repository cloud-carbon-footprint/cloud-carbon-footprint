variable "terraform_state_bucket" {
  type    = string
  default = "YOUR-TERRAFORM-STATE-BUCKET-NAME"
}

variable "default_region" {
  type    = string
  default = "YOUR-DEFAULT-AWS-REGION"
}

variable "vpc_id" {
  type    = string
  default = "YOUR-VPC-ID"
}

variable "ami_id" {
  type    = string
  default = "ami-05cd35b907b4ffe77" # Amazon Linux AMI 2. This changes based on your AWS region.
}

variable "instance_type" {
  type    = string
  default = "t2.medium"
}

variable "key_name" {
  type    = string
  default = "YOUR-KEY-PAIR"
}

variable "private_subnet_id" {
  type    = string
  default = "YOUR-PRIVATE-SUBNET-ID"
}

# If you have a security group that allows inbound traffic to connections coming from within a VPN
variable "vpn_security_group_id" {
  type    = string
  default = "YOUR-VPN-SECURITY-GROUP-ID"
}

variable "application" {
  type    = string
  default = "ccf"
}

variable "environment" {
  type    = string
  default = "prod"
}

variable "dns_name" {
  type    = string
  default = "ccf"
}

# This might be useful if you wanna restrict traffic to private subnets
variable "allowed_cidr_blocks" {
  type    = list(string)
  default = ["YOUR-ALLOWED-CIDR-BLOCK-1", "YOUR-ALLOWED-CIDR-BLOCK-2", "YOUR-ALLOWED-CIDR-BLOCK-3"]
}
