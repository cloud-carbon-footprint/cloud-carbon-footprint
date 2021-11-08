locals {
  name = "${var.application}-${var.environment}"

  template_vars = {
    application = var.application
    environment = var.environment
  }

  tags = {
    "Application" = var.application
    "Deployment"  = "terraform"
    "Environment" = var.environment
    "Name"        = local.name
  }
}