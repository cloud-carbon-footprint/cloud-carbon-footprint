variable "default_region" {
  description = "Name of the region to use"
  type        = string
  default     = "us-east-1"
}

variable "vpc_id" {
  description = "ID of the VPC to use"
  type        = string
}

variable "ami_id" {
  description = "AWS AMI to use"
  type        = string
  default     = null
}

variable "instance_type" {
  description = "EC2 instance to use"
  type        = string
  default     = "t3.large"
}

variable "key_pair_name" {
  description = "AWS Key Pair name to use"
  type        = string
  default     = null
}

variable "private_subnets" {
  description = "Private subnets to use"
  type        = list(string)
}

variable "public_subnets" {
  description = "Public ubnets to use"
  type        = list(string)
  default     = []
}

variable "is_private" {
  type        = bool
  description = "Whether the tool should be private or not"
  default     = true
}

variable "certificate_arn" {
  description = "ARN of the certificate to use"
  type        = string
  default     = null
}

variable "prefix" {
  description = "Prefix for naming resources"
  type        = string
  default     = "ccf"
}

variable "application_port" {
  description = "The port to run the application on"
  type        = number
  default     = 80
}

variable "ssh_allowed_cidr_blocks" {
  description = "List of allowed CIDR blocks to access box via ssh. This might be useful if you wanna restrict traffic to private subnets"
  type        = list(string)
  default     = []
}

variable "athena_region" {
  description = "The region that the athena db is located"
  type        = string
}

variable "athena_db_name" {
  description = "The name of the athena db"
  type        = string
}

variable "athena_db_table" {
  description = "The name of the athena db table"
  type        = string
}

variable "aws_billing_account_id" {
  description = "The ID of the AWS billing account to target"
  type        = string
}

variable "aws_billing_account_name" {
  description = "The name of the AWS billing account to target"
  type        = string
}

variable "billing_data_bucket" {
  description = "The AWS S3 bucket where billing report data is being exported to"
  type        = string
}

variable "athena_query_results_bucket" {
  description = "The AWS S3 bucket used by athena to store query results"
  type        = string
}

variable "public_keys" {
  description = "List of extra public keys to authorize access to"
  type        = list(string)
  default     = []
}

variable "ccf_git_branch" {
  description = "The branch of the CCF tool to checkout"
  type        = string
  default     = "trunk"
}

variable "enable_ssm_session_manager" {
  description = "Enable AWS SSM Session Manager access"
  type        = bool
  default     = true
}

variable "ccf_git_repo" {
  description = "The git repository of the CCF tool"
  type        = string
  default     = "https://github.com/cloud-carbon-footprint/cloud-carbon-footprint.git"
}
