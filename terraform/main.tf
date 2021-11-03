resource "aws_s3_bucket" "ccf_terraform_state" {
  bucket = "cloudcarbonfootprint-terraform"

  versioning {
    enabled = true
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "aws_security_group" "ccf_instance_sg" {
  name   = "ccf-instance-sg"
  vpc_id = var.vpc_id

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidr_blocks
    security_groups = [
      "${var.vpn_security_group_id}"
    ]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidr_blocks
    security_groups = [
      "${var.vpn_security_group_id}"
    ]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}

resource "aws_iam_instance_profile" "ccf_instance_profile" {
  name = "ccf-instance-profile"
  role = aws_iam_role.ccf_api_role.name
}

module "ec2_instance" {
  source  = "terraform-aws-modules/ec2-instance/aws"
  version = "~> 3.0"

  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = var.key_name
  monitoring             = true
  vpc_security_group_ids = [aws_security_group.ccf_instance_sg.id]
  subnet_id              = var.private_subnet_id
  user_data              = file("install.sh")
  iam_instance_profile   = aws_iam_instance_profile.ccf_instance_profile.name

  tags = local.tags
}
