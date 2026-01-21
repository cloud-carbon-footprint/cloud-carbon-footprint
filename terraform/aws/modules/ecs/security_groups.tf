#tfsec:ignore:aws-ec2-no-public-egress-sgr #tfsec:ignore:aws-ec2-no-public-ingress-sgr
resource "aws_security_group" "alb" {
  name        = "${var.prefix}-alb-sg"
  vpc_id      = var.vpc_id
  description = "Limit access to/from the ${var.prefix} alb"

  dynamic "ingress" {
    for_each = var.certificate_arn != null ? [443, 80] : [80]
    content {
      description      = "Allow access to ${ingress.value} listener port"
      from_port        = ingress.value
      to_port          = ingress.value
      protocol         = "tcp"
      cidr_blocks      = ["0.0.0.0/0"]
      ipv6_cidr_blocks = ["::/0"]
    }
  }

  egress {
    description      = "Allow outgoing traffic"
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name = "${var.prefix}-alb-sg"
  }
}

#tfsec:ignore:aws-ec2-no-public-egress-sgr
resource "aws_security_group" "ecs" {
  name        = "${var.prefix}-ecs-sg"
  vpc_id      = var.vpc_id
  description = "Limit access to/from the ${var.prefix} ecs instances"

  ingress {
    description     = "Allow access to CCF API service"
    from_port       = var.ccf_api_container_port
    to_port         = var.ccf_api_container_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
    self            = true
  }

  ingress {
    description     = "Allow access to CCF client service"
    from_port       = var.ccf_client_container_port
    to_port         = var.ccf_client_container_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
    self            = true
  }

  egress {
    description      = "Allow outgoing traffic"
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name = "${var.prefix}-ecs-sg"
  }
}
