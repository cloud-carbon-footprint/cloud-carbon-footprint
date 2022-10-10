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
| [aws_autoscaling_group.ccf](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/autoscaling_group) | resource |
| [aws_iam_instance_profile.ccf_instance_profile](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_instance_profile) | resource |
| [aws_launch_template.ccf](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/launch_template) | resource |
| [aws_lb.alb](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb) | resource |
| [aws_lb_listener.http](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_listener) | resource |
| [aws_lb_listener.https](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_listener) | resource |
| [aws_lb_target_group.ccf](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_target_group) | resource |
| [aws_security_group.alb](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group) | resource |
| [aws_security_group.ccf_instance_sg](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group) | resource |
| [aws_ami.amazon_linux_2](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/ami) | data source |
| [aws_instances.main](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/instances) | data source |
| [aws_region.main](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/region) | data source |
| [aws_s3_bucket.athena_query_results_bucket](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/s3_bucket) | data source |
| [aws_s3_bucket.billing_data_bucket](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/s3_bucket) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_ami_id"></a> [ami\_id](#input\_ami\_id) | AWS AMI to use | `string` | `null` | no |
| <a name="input_application_port"></a> [application\_port](#input\_application\_port) | The port to run the application on | `number` | `80` | no |
| <a name="input_athena_db_name"></a> [athena\_db\_name](#input\_athena\_db\_name) | The name of the athena db | `string` | n/a | yes |
| <a name="input_athena_db_table"></a> [athena\_db\_table](#input\_athena\_db\_table) | The name of the athena db table | `string` | n/a | yes |
| <a name="input_athena_query_results_bucket"></a> [athena\_query\_results\_bucket](#input\_athena\_query\_results\_bucket) | The AWS S3 bucket used by athena to store query results | `string` | n/a | yes |
| <a name="input_athena_region"></a> [athena\_region](#input\_athena\_region) | The region that the athena db is located | `string` | n/a | yes |
| <a name="input_aws_billing_account_id"></a> [aws\_billing\_account\_id](#input\_aws\_billing\_account\_id) | The ID of the AWS billing account to target | `string` | n/a | yes |
| <a name="input_aws_billing_account_name"></a> [aws\_billing\_account\_name](#input\_aws\_billing\_account\_name) | The name of the AWS billing account to target | `string` | n/a | yes |
| <a name="input_billing_data_bucket"></a> [billing\_data\_bucket](#input\_billing\_data\_bucket) | The AWS S3 bucket where billing report data is being exported to | `string` | n/a | yes |
| <a name="input_ccf_git_branch"></a> [ccf\_git\_branch](#input\_ccf\_git\_branch) | The branch of the CCF tool to checkout | `string` | `"trunk"` | no |
| <a name="input_ccf_git_repo"></a> [ccf\_git\_repo](#input\_ccf\_git\_repo) | The git repository of the CCF tool | `string` | `"https://github.com/cloud-carbon-footprint/cloud-carbon-footprint.git"` | no |
| <a name="input_certificate_arn"></a> [certificate\_arn](#input\_certificate\_arn) | ARN of the certificate to use | `string` | `null` | no |
| <a name="input_default_region"></a> [default\_region](#input\_default\_region) | Name of the region to use | `string` | `"us-east-1"` | no |
| <a name="input_enable_ssm_session_manager"></a> [enable\_ssm\_session\_manager](#input\_enable\_ssm\_session\_manager) | Enable AWS SSM Session Manager access | `bool` | `true` | no |
| <a name="input_instance_type"></a> [instance\_type](#input\_instance\_type) | EC2 instance to use | `string` | `"t3.large"` | no |
| <a name="input_is_private"></a> [is\_private](#input\_is\_private) | Whether the tool should be private or not | `bool` | `true` | no |
| <a name="input_key_pair_name"></a> [key\_pair\_name](#input\_key\_pair\_name) | AWS Key Pair name to use | `string` | `null` | no |
| <a name="input_prefix"></a> [prefix](#input\_prefix) | Prefix for naming resources | `string` | `"ccf"` | no |
| <a name="input_private_subnets"></a> [private\_subnets](#input\_private\_subnets) | Private subnets to use | `list(string)` | n/a | yes |
| <a name="input_public_keys"></a> [public\_keys](#input\_public\_keys) | List of extra public keys to authorize access to | `list(string)` | `[]` | no |
| <a name="input_public_subnets"></a> [public\_subnets](#input\_public\_subnets) | Public ubnets to use | `list(string)` | `[]` | no |
| <a name="input_ssh_allowed_cidr_blocks"></a> [ssh\_allowed\_cidr\_blocks](#input\_ssh\_allowed\_cidr\_blocks) | List of allowed CIDR blocks to access box via ssh. This might be useful if you wanna restrict traffic to private subnets | `list(string)` | `[]` | no |
| <a name="input_vpc_id"></a> [vpc\_id](#input\_vpc\_id) | ID of the VPC to use | `string` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_ccf_instance_ids"></a> [ccf\_instance\_ids](#output\_ccf\_instance\_ids) | n/a |
| <a name="output_ccf_lb_dns_name"></a> [ccf\_lb\_dns\_name](#output\_ccf\_lb\_dns\_name) | n/a |
| <a name="output_ccf_lb_zone_id"></a> [ccf\_lb\_zone\_id](#output\_ccf\_lb\_zone\_id) | n/a |
| <a name="output_ccf_port"></a> [ccf\_port](#output\_ccf\_port) | n/a |

© 2022 Thoughtworks, Inc.
