variable "prefix" {
  description = "Prefix for created resources"
  type        = string
}
variable "billing_data_bucket_arn" {
  description = "The ARN of the AWS S3 bucket where billing report data is being exported to"
  type        = string
}
variable "athena_query_results_bucket_arn" {
  description = "The ARN of the AWS S3 bucket where athena query results are stored"
  type        = string
}
variable "enable_ssm_session_manager" {
  description = "Enable AWS SSM Session Manager access"
  type        = bool
  default     = false
}
variable "assume_role_principal_identifiers" {
  type    = list(string)
  default = ["ec2.amazonaws.com"]
}