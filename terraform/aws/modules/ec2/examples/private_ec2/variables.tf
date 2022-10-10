variable "aws_region" {
  default = "us-east-1"
}
variable "project_name" {
  default = "ccf-ec2"
}
variable "default_tags" {
  default = {
    Managed-By = "Terraform"
  }
}
variable "cidr" {
  type    = string
  default = "10.0.0.0/16"
}
variable "dns_name" {
  type = string
}
variable "hosted_zone_id" {
  type = string
}
variable "aws_billing_account_id" {
  type = string
}
variable "aws_billing_account_name" {
  type = string
}
variable "billing_data_bucket" {
  type = string
}
variable "athena_query_results_bucket" {
  type = string
}
variable "athena_db_table" {
  type = string
}
variable "athena_db_name" {
  type = string
}
variable "athena_region" {
  type = string
}
