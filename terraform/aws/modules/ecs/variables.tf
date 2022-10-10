variable "vpc_id" {
  description = "ID of the VPC to use"
  type        = string
}

variable "private_subnets" {
  description = "Private subnets to use"
  type        = list(string)
}

variable "public_subnets" {
  description = "Public subnets to use"
  type        = list(string)
  default     = []
}

variable "prefix" {
  description = "Prefix for naming resources"
  type        = string
  default     = "ccf"
}

variable "ecs_cpu_architecture" {
  description = "Container architecture in ECS"
  type        = string
  default     = "X86_64"
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

variable "ccf_api_container_registry" {
  type        = string
  description = "Registry to find the CCF api container"
  default     = "cloudcarbonfootprint/api"
}

variable "ccf_client_container_registry" {
  type        = string
  description = "Registry to find the CCF client container"
  default     = "cloudcarbonfootprint/client"
}

variable "ccf_api_version" {
  type        = string
  description = "Version of the CCF tool's api package to use"
  default     = "latest"
}

variable "ccf_client_version" {
  type        = string
  description = "Version of the CCF tool's client package to use"
  default     = "latest"
}

variable "ccf_client_container_port" {
  description = "The container port of the CCF client tool"
  default     = 80
}

variable "ccf_api_container_port" {
  description = "The container port of the CCF api tool"
  default     = 4000
}

variable "log_retention" {
  description = "How many days to keep ccf logs"
  type        = number
  default     = 90
}

variable "certificate_arn" {
  description = "ARN of the certificate to use"
  type        = string
  default     = null
}

variable "aws_accounts" {
  description = "This is array of objects that match the AWS accounts you want to pull usage data from to run energy/carbon estimation for."
  default     = []
  type = list(object({
    id   = string
    name = string
  }))
}

variable "is_private" {
  type        = bool
  description = "Whether the tool should be private or not"
  default     = true
}

variable "ecs_capacity_providers" {
  description = "Capacity provider config to use with ECS services"
  type = list(object({
    capacity_provider = string
    weight            = number
    default           = bool
  }))
  default = [
    {
      capacity_provider = "FARGATE"
      weight            = 1
      default           = true
    }
  ]
}

variable "kms_key_id" {
  description = "KMS key to use for encryption"
  type        = string
  default     = null
}
