locals {
  default_forward_action_config = {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ccf.arn
  }
  default_redirect_action_config = {
    type        = "redirect"
    port        = "443"
    protocol    = "HTTPS"
    status_code = "HTTP_301"
  }
}

#tfsec:ignore:aws-elb-alb-not-public
resource "aws_lb" "alb" {
  name               = "${var.prefix}-alb"
  load_balancer_type = "application"

  internal        = var.is_private
  security_groups = [aws_security_group.alb.id]
  subnets         = var.is_private ? var.private_subnets : var.public_subnets

  idle_timeout               = 120
  enable_deletion_protection = false
  drop_invalid_header_fields = true
}

#tfsec:ignore:aws-elb-http-not-used
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 80
  protocol          = "HTTP"

  dynamic "default_action" {
    for_each = var.certificate_arn != null ? [local.default_redirect_action_config] : [local.default_forward_action_config]

    content {
      type             = default_action.value.type
      target_group_arn = try(default_action.value.target_group_arn, null)

      dynamic "redirect" {
        for_each = default_action.value.type == "redirect" ? [true] : []

        content {
          port        = default_action.value.port
          protocol    = default_action.value.protocol
          status_code = default_action.value.status_code
        }
      }
    }
  }
}

resource "aws_lb_listener" "https" {
  count = var.certificate_arn != null ? 1 : 0

  load_balancer_arn = aws_lb.alb.id
  port              = 443
  protocol          = "HTTP"
  certificate_arn   = var.certificate_arn

  default_action {
    target_group_arn = aws_lb_target_group.ccf.arn
    type             = "forward"
  }
}

resource "aws_lb_target_group" "ccf" {
  name     = "${var.prefix}-ccf"
  port     = var.application_port
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    matcher             = "200"
    protocol            = "HTTP"
    interval            = "30"
    timeout             = "3"
    healthy_threshold   = "3"
    unhealthy_threshold = "2"
  }
}
