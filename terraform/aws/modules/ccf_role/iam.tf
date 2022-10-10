data "aws_iam_policy_document" "assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"

    principals {
      type        = "Service"
      identifiers = var.assume_role_principal_identifiers
    }
  }
}

#tfsec:ignore:aws-iam-no-policy-wildcards
data "aws_iam_policy_document" "s3" {
  statement {
    actions = [
      "s3:GetBucketLocation",
      "s3:GetObject",
      "s3:ListBucket",
      "s3:ListBucketMultipartUploads",
      "s3:ListMultipartUploadParts",
      "s3:AbortMultipartUpload",
      "s3:PutObject",
    ]
    effect = "Allow"
    resources = [
      var.billing_data_bucket_arn,
      "${var.billing_data_bucket_arn}/*",
      var.athena_query_results_bucket_arn,
      "${var.athena_query_results_bucket_arn}/*"
    ]
  }
}

#tfsec:ignore:aws-iam-no-policy-wildcards
data "aws_iam_policy_document" "athena" {
  statement {
    actions = [
      "athena:StartQueryExecution",
      "athena:GetQueryExecution",
      "athena:GetQueryResults",
      "athena:GetWorkGroup",
    ]
    effect    = "Allow"
    resources = ["*"]
  }
}

#tfsec:ignore:aws-iam-no-policy-wildcards
data "aws_iam_policy_document" "ce" {
  statement {
    actions   = ["ce:GetRightsizingRecommendation"]
    effect    = "Allow"
    resources = ["*"]
  }
}

#tfsec:ignore:aws-iam-no-policy-wildcards
data "aws_iam_policy_document" "glue" {
  statement {
    actions = [
      "glue:GetDatabase",
      "glue:GetTable",
      "glue:GetPartitions",
    ]
    effect    = "Allow"
    resources = ["*"]
  }
}

#tfsec:ignore:aws-iam-no-policy-wildcards
data "aws_iam_policy_document" "ssm" {
  statement {
    actions = [
      "ssmmessages:CreateControlChannel",
      "ssmmessages:CreateDataChannel",
      "ssmmessages:OpenControlChannel",
      "ssmmessages:OpenDataChannel"
    ]
    effect    = "Allow"
    resources = ["*"]
  }
}

resource "aws_iam_policy" "s3" {
  name   = "${var.prefix}-api-s3-policy"
  policy = data.aws_iam_policy_document.s3.json
}

resource "aws_iam_policy" "athena" {
  name   = "${var.prefix}-api-athena-policy"
  policy = data.aws_iam_policy_document.athena.json
}

resource "aws_iam_policy" "ce" {
  name   = "${var.prefix}-api-ce-policy"
  policy = data.aws_iam_policy_document.ce.json
}

resource "aws_iam_policy" "glue" {
  name   = "${var.prefix}-api-glue-policy"
  policy = data.aws_iam_policy_document.glue.json
}

resource "aws_iam_policy" "ssm" {
  name   = "${var.prefix}-api-ssm-policy"
  policy = data.aws_iam_policy_document.ssm.json
}

resource "aws_iam_role_policy_attachment" "s3" {
  policy_arn = aws_iam_policy.s3.arn
  role       = aws_iam_role.this.name
}

resource "aws_iam_role_policy_attachment" "athena" {
  policy_arn = aws_iam_policy.athena.arn
  role       = aws_iam_role.this.name
}

resource "aws_iam_role_policy_attachment" "ce" {
  policy_arn = aws_iam_policy.ce.arn
  role       = aws_iam_role.this.name
}

resource "aws_iam_role_policy_attachment" "glue" {
  policy_arn = aws_iam_policy.glue.arn
  role       = aws_iam_role.this.name
}

resource "aws_iam_role_policy_attachment" "ssm" {
  policy_arn = aws_iam_policy.ssm.arn
  role       = aws_iam_role.this.name
}

resource "aws_iam_role_policy_attachment" "ssm_policy" {
  count = var.enable_ssm_session_manager ? 1 : 0

  role       = aws_iam_role.this.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role" "this" {
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
  name               = "${var.prefix}-api-role"
}
