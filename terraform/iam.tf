# policy documents

data "aws_iam_policy_document" "assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "s3" {
  statement {
    actions   = ["s3:*"]
    effect    = "Allow"
    resources = [data.aws_s3_bucket.billing_data_bucket.arn, "${data.aws_s3_bucket.billing_data_bucket.arn}/*"]
  }
  statement {
    actions   = ["s3:*"]
    effect    = "Allow"
    resources = [data.aws_s3_bucket.athena_query_results_bucket.arn, "${data.aws_s3_bucket.athena_query_results_bucket.arn}/*"]
  }
}

data "aws_iam_policy_document" "athena" {
  statement {
    actions   = ["athena:*"]
    effect    = "Allow"
    resources = ["*"]
  }
}

data "aws_iam_policy_document" "ce" {
  statement {
    actions   = ["ce:GetRightsizingRecommendation"]
    effect    = "Allow"
    resources = ["*"]
  }
}

data "aws_iam_policy_document" "glue" {
  statement {
    actions   = ["glue:*"]
    effect    = "Allow"
    resources = ["*"]
  }
}

# policies

resource "aws_iam_policy" "s3" {
  name   = "ccf-api-s3-policy"
  policy = data.aws_iam_policy_document.s3.json
}

resource "aws_iam_policy" "athena" {
  name   = "ccf-api-athena-policy"
  policy = data.aws_iam_policy_document.athena.json
}

resource "aws_iam_policy" "ce" {
  name   = "ccf-api-ce-policy"
  policy = data.aws_iam_policy_document.ce.json
}

resource "aws_iam_policy" "glue" {
  name   = "ccf-api-glue-policy"
  policy = data.aws_iam_policy_document.glue.json
}

# policy attachments

resource "aws_iam_role_policy_attachment" "s3" {
  policy_arn = aws_iam_policy.s3.arn
  role       = aws_iam_role.ccf_api_role.name
}

resource "aws_iam_role_policy_attachment" "athena" {
  policy_arn = aws_iam_policy.athena.arn
  role       = aws_iam_role.ccf_api_role.name
}

resource "aws_iam_role_policy_attachment" "ce" {
  policy_arn = aws_iam_policy.ce.arn
  role       = aws_iam_role.ccf_api_role.name
}

resource "aws_iam_role_policy_attachment" "glue" {
  policy_arn = aws_iam_policy.glue.arn
  role       = aws_iam_role.ccf_api_role.name
}

# role
resource "aws_iam_role" "ccf_api_role" {
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
  name               = "ccf-api-role"
}
