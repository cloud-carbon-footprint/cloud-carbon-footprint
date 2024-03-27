resource "aws_iam_instance_profile" "ccf_instance_profile" {
  name = "${var.prefix}-profile"
  role = module.ccf_role.role_name
}

resource "aws_launch_template" "ccf" {
  name_prefix   = "${var.prefix}-asg-lt-"
  image_id      = var.ami_id != null ? var.ami_id : data.aws_ami.amazon_linux_2.id
  instance_type = var.instance_type
  key_name      = var.key_pair_name

  monitoring {
    enabled = true
  }

  iam_instance_profile {
    arn = aws_iam_instance_profile.ccf_instance_profile.arn
  }

  vpc_security_group_ids = [aws_security_group.ccf_instance_sg.id]

  metadata_options {
    http_tokens = "required"
  }

  user_data = base64encode(templatefile("${path.module}/templates/install.sh.tpl", {
    target_account_role_name   = module.ccf_role.role_name
    athena_db_name             = var.athena_db_name
    athena_db_table            = var.athena_db_table
    athena_region              = var.athena_region
    athena_results_bucket_name = data.aws_s3_bucket.athena_query_results_bucket.bucket
    aws_billing_account_id     = var.aws_billing_account_id
    aws_billing_account_name   = var.aws_billing_account_name
    auth_mode                  = "EC2-METADATA"
    public_keys                = var.public_keys
    ccf_git_repo               = var.ccf_git_repo
    ccf_git_branch             = var.ccf_git_branch
    client_port                = var.application_port
    client_host                = "0.0.0.0"
  }))
}

resource "aws_autoscaling_group" "ccf" {
  name             = "${var.prefix}-asg"
  max_size         = 4
  min_size         = 1
  desired_capacity = 1

  vpc_zone_identifier = var.private_subnets

  target_group_arns = [
    aws_lb_target_group.ccf.arn
  ]

  launch_template {
    id      = aws_launch_template.ccf.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    propagate_at_launch = true
    value               = "${var.prefix}-asg-instance"
  }
}
