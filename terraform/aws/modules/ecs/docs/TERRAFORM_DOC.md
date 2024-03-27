## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | >= 1.1 |
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | >= 4.0 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_aws"></a> [aws](#provider\_aws) | >= 4.0 |

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_ccf_role"></a> [ccf\_role](#module\_ccf\_role) | ../ccf_role | n/a |

## Resources

| Name | Type |
|------|------|
| [aws_appautoscaling_policy.ecs_policy_cpu](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/appautoscaling_policy) | resource |
| [aws_appautoscaling_policy.ecs_policy_memory](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/appautoscaling_policy) | resource |
| [aws_appautoscaling_target.ecs_target](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/appautoscaling_target) | resource |
| [aws_cloudwatch_log_group.ecs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_log_group) | resource |
| [aws_ecs_cluster.main](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_cluster) | resource |
| [aws_ecs_cluster_capacity_providers.main](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_cluster_capacity_providers) | resource |
| [aws_ecs_service.api](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_service) | resource |
| [aws_ecs_service.client](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_service) | resource |
| [aws_ecs_task_definition.api](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_task_definition) | resource |
| [aws_ecs_task_definition.client](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_task_definition) | resource |
| [aws_iam_role.ecs_task_execution](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role) | resource |
| [aws_iam_role_policy_attachment.ecsTaskExecutionRole_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |
| [aws_lb.alb](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb) | resource |
| [aws_lb_listener.http](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_listener) | resource |
| [aws_lb_listener.https](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_listener) | resource |
| [aws_lb_listener_rule.api](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_listener_rule) | resource |
| [aws_lb_target_group.ecs_ccf_api](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_target_group) | resource |
| [aws_lb_target_group.ecs_ccf_client](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_target_group) | resource |
| [aws_security_group.alb](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group) | resource |
| [aws_security_group.ecs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group) | resource |
| [aws_ami.amazon_linux_2](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/ami) | data source |
| [aws_iam_policy_document.ecs_assume_role](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document) | data source |
| [aws_region.main](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/region) | data source |
| [aws_s3_bucket.athena_query_results_bucket](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/s3_bucket) | data source |
| [aws_s3_bucket.billing_data_bucket](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/s3_bucket) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_athena_db_name"></a> [athena\_db\_name](#input\_athena\_db\_name) | The name of the athena db | `string` | n/a | yes |
| <a name="input_athena_db_table"></a> [athena\_db\_table](#input\_athena\_db\_table) | The name of the athena db table | `string` | n/a | yes |
| <a name="input_athena_query_results_bucket"></a> [athena\_query\_results\_bucket](#input\_athena\_query\_results\_bucket) | The AWS S3 bucket used by athena to store query results | `string` | n/a | yes |
| <a name="input_athena_region"></a> [athena\_region](#input\_athena\_region) | The region that the athena db is located | `string` | n/a | yes |
| <a name="input_aws_accounts"></a> [aws\_accounts](#input\_aws\_accounts) | This is array of objects that match the AWS accounts you want to pull usage data from to run energy/carbon estimation for. | <pre>list(object({<br>    id   = string<br>    name = string<br>  }))</pre> | `[]` | no |
| <a name="input_aws_billing_account_id"></a> [aws\_billing\_account\_id](#input\_aws\_billing\_account\_id) | The ID of the AWS billing account to target | `string` | n/a | yes |
| <a name="input_aws_billing_account_name"></a> [aws\_billing\_account\_name](#input\_aws\_billing\_account\_name) | The name of the AWS billing account to target | `string` | n/a | yes |
| <a name="input_billing_data_bucket"></a> [billing\_data\_bucket](#input\_billing\_data\_bucket) | The AWS S3 bucket where billing report data is being exported to | `string` | n/a | yes |
| <a name="input_ccf_api_container_port"></a> [ccf\_api\_container\_port](#input\_ccf\_api\_container\_port) | The container port of the CCF api tool | `number` | `4000` | no |
| <a name="input_ccf_api_container_registry"></a> [ccf\_api\_container\_registry](#input\_ccf\_api\_container\_registry) | Registry to find the CCF api container | `string` | `"cloudcarbonfootprint/api"` | no |
| <a name="input_ccf_api_version"></a> [ccf\_api\_version](#input\_ccf\_api\_version) | Version of the CCF tool's api package to use | `string` | `"latest"` | no |
| <a name="input_ccf_client_container_port"></a> [ccf\_client\_container\_port](#input\_ccf\_client\_container\_port) | The container port of the CCF client tool | `number` | `80` | no |
| <a name="input_ccf_client_container_registry"></a> [ccf\_client\_container\_registry](#input\_ccf\_client\_container\_registry) | Registry to find the CCF client container | `string` | `"cloudcarbonfootprint/client"` | no |
| <a name="input_ccf_client_version"></a> [ccf\_client\_version](#input\_ccf\_client\_version) | Version of the CCF tool's client package to use | `string` | `"latest"` | no |
| <a name="input_certificate_arn"></a> [certificate\_arn](#input\_certificate\_arn) | ARN of the certificate to use | `string` | `null` | no |
| <a name="input_ecs_capacity_providers"></a> [ecs\_capacity\_providers](#input\_ecs\_capacity\_providers) | Capacity provider config to use with ECS services | <pre>list(object({<br>    capacity_provider = string<br>    weight            = number<br>    default           = bool<br>  }))</pre> | <pre>[<br>  {<br>    "capacity_provider": "FARGATE",<br>    "default": true,<br>    "weight": 1<br>  }<br>]</pre> | no |
| <a name="input_ecs_cpu_architecture"></a> [ecs\_cpu\_architecture](#input\_ecs\_cpu\_architecture) | Container architecture in ECS | `string` | `"X86_64"` | no |
| <a name="input_is_private"></a> [is\_private](#input\_is\_private) | Whether the tool should be private or not | `bool` | `true` | no |
| <a name="input_kms_key_id"></a> [kms\_key\_id](#input\_kms\_key\_id) | KMS key to use for encryption | `string` | `null` | no |
| <a name="input_log_retention"></a> [log\_retention](#input\_log\_retention) | How many days to keep ccf logs | `number` | `90` | no |
| <a name="input_prefix"></a> [prefix](#input\_prefix) | Prefix for naming resources | `string` | `"ccf"` | no |
| <a name="input_private_subnets"></a> [private\_subnets](#input\_private\_subnets) | Private subnets to use | `list(string)` | n/a | yes |
| <a name="input_public_subnets"></a> [public\_subnets](#input\_public\_subnets) | Public subnets to use | `list(string)` | `[]` | no |
| <a name="input_vpc_id"></a> [vpc\_id](#input\_vpc\_id) | ID of the VPC to use | `string` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_ccf_api_port"></a> [ccf\_api\_port](#output\_ccf\_api\_port) | n/a |
| <a name="output_ccf_client_port"></a> [ccf\_client\_port](#output\_ccf\_client\_port) | n/a |
| <a name="output_ccf_lb_dns_name"></a> [ccf\_lb\_dns\_name](#output\_ccf\_lb\_dns\_name) | n/a |
| <a name="output_ccf_lb_zone_id"></a> [ccf\_lb\_zone\_id](#output\_ccf\_lb\_zone\_id) | n/a |

© 2022 Thoughtworks, Inc.
