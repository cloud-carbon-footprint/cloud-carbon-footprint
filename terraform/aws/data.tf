data "aws_s3_bucket" "billing_data_bucket" {
  bucket = "YOUR-AWS-BILLING-DATA-S3-BUCKET"
}

data "aws_s3_bucket" "athena_query_results_bucket" {
  bucket = "YOUR-AWS-ATHENA-RESULTS-S3-BUCKET"
}
