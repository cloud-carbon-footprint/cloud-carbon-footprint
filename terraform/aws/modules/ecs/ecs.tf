locals {
  ccf_client_container_name = "client"
  ccf_api_container_name    = "api"

  aws_accounts = jsonencode(concat([{ id = var.aws_billing_account_id, name = var.aws_billing_account_name }], var.aws_accounts))
}

resource "aws_ecs_cluster" "main" {
  name = "${var.prefix}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/aws/${var.prefix}/ecs"
  retention_in_days = var.log_retention
  kms_key_id        = var.kms_key_id

  tags = {
    Name = "/aws/${var.prefix}/ecs"
  }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name       = aws_ecs_cluster.main.name
  capacity_providers = [for ecs_capacity_provider in var.ecs_capacity_providers : ecs_capacity_provider.capacity_provider]

  dynamic "default_capacity_provider_strategy" {
    for_each = [for ecs_capacity_provider in var.ecs_capacity_providers : ecs_capacity_provider if ecs_capacity_provider.default]
    content {
      capacity_provider = default_capacity_provider_strategy.value.capacity_provider
    }
  }
}

resource "aws_ecs_task_definition" "api" {
  family                   = "${var.prefix}-api"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  memory                   = 8192
  cpu                      = 2048
  task_role_arn            = module.ccf_role.role_arn
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  container_definitions = jsonencode([
    {
      name      = local.ccf_api_container_name,
      image     = "${var.ccf_api_container_registry}:${var.ccf_api_version}",
      essential = true,
      portMappings = [
        {
          containerPort = var.ccf_api_container_port,
          hostPort      = var.ccf_api_container_port
        }
      ],
      environment = [
        {
          name  = "NODE_OPTIONS"
          value = "--max-old-space-size=4096"
        },
        {
          name  = "AWS_USE_BILLING_DATA"
          value = "true"
        },
        {
          name  = "AWS_AUTH_MODE"
          value = "ECS-METADATA"
        },
        {
          name  = "AWS_TARGET_ACCOUNT_ROLE_NAME"
          value = module.ccf_role.role_name
        },
        {
          name  = "AWS_ATHENA_DB_NAME"
          value = var.athena_db_name
        },
        {
          name  = "AWS_ATHENA_DB_TABLE"
          value = var.athena_db_table
        },
        {
          name  = "AWS_ATHENA_REGION"
          value = var.athena_region
        },
        {
          name  = "AWS_ATHENA_QUERY_RESULT_LOCATION"
          value = "s3://${data.aws_s3_bucket.athena_query_results_bucket.bucket}"
        },
        {
          name  = "AWS_BILLING_ACCOUNT_ID"
          value = var.aws_billing_account_id
        },
        {
          name  = "AWS_BILLING_ACCOUNT_NAME"
          value = var.aws_billing_account_name
        },
        {
          name  = "AWS_ACCOUNTS"
          value = local.aws_accounts
        }
      ],
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name
          awslogs-stream-prefix = "ccf"
          awslogs-region        = data.aws_region.main.name
        }
      },
      linuxParameters = {
        initProcessEnabled = true
      }
    }
  ])
  runtime_platform {
    cpu_architecture = var.ecs_cpu_architecture
  }

  ephemeral_storage {
    size_in_gib = 30
  }
}

resource "aws_ecs_task_definition" "client" {
  family                   = "${var.prefix}-client"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  memory                   = 512
  cpu                      = 256
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  container_definitions = jsonencode([
    {
      name      = local.ccf_client_container_name,
      image     = "${var.ccf_client_container_registry}:${var.ccf_client_version}",
      essential = true,
      portMappings = [
        {
          containerPort = var.ccf_client_container_port,
          hostPort      = var.ccf_client_container_port
        }
      ],
      entryPoint = [],
      command = ["/bin/sh", "-c", join(" ", [
        "echo '${base64encode(templatefile("${path.module}/templates/nginx.conf.tpl", { client_port = var.ccf_client_container_port }))}' | base64 -d > /etc/nginx/nginx.conf;",
        "/docker-entrypoint.sh nginx -g \"daemon off;\""
      ])],
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name
          awslogs-stream-prefix = "ccf"
          awslogs-region        = data.aws_region.main.name
        }
      },
      linuxParameters = {
        initProcessEnabled = true
      }
    }
  ])
  runtime_platform {
    cpu_architecture = var.ecs_cpu_architecture
  }
}

resource "aws_ecs_service" "api" {
  name                               = "${var.prefix}-api-svc"
  cluster                            = aws_ecs_cluster.main.id
  task_definition                    = aws_ecs_task_definition.api.arn
  desired_count                      = 1
  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200
  scheduling_strategy                = "REPLICA"

  dynamic "capacity_provider_strategy" {
    for_each = var.ecs_capacity_providers
    content {
      capacity_provider = capacity_provider_strategy.value.capacity_provider
      weight            = capacity_provider_strategy.value.weight
    }
  }

  network_configuration {
    security_groups  = [aws_security_group.ecs.id]
    subnets          = var.private_subnets
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.ecs_ccf_api.arn
    container_name   = local.ccf_api_container_name
    container_port   = var.ccf_api_container_port
  }
}

resource "aws_ecs_service" "client" {
  name                               = "${var.prefix}-client-svc"
  cluster                            = aws_ecs_cluster.main.id
  task_definition                    = aws_ecs_task_definition.client.arn
  desired_count                      = 1
  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200
  scheduling_strategy                = "REPLICA"

  dynamic "capacity_provider_strategy" {
    for_each = var.ecs_capacity_providers
    content {
      capacity_provider = capacity_provider_strategy.value.capacity_provider
      weight            = capacity_provider_strategy.value.weight
    }
  }

  network_configuration {
    security_groups  = [aws_security_group.ecs.id]
    subnets          = var.private_subnets
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.ecs_ccf_client.arn
    container_name   = local.ccf_client_container_name
    container_port   = var.ccf_client_container_port
  }
}
