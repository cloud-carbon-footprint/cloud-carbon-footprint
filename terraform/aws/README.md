# CCF Infrastructure Setup (AWS/Terraform)

## Overview

This directory contains basic infrastructure code to setup the application in AWS using basic services such as EC2, IAM, Route53. The goal is to have a simple and generic setup that can be configured to each customer needs.

Although the aim was to remain generic, some things might not be entirely applicable to your particular case e.g. you might not have a VPN setup to access private compute instances. You should consider revisiting the architecture and adjusting the infrastructure accordingly.

## Architecture

The general architecture consists of the following components:

- EC2 instance and instance profile
- EC2 Security Group
- IAM Policies and Roles
- ElasticIP
- Route53 DNS Record
- S3 Bucket (Terraform State Management)

### EC2 instance

It is the compute resource on which the CCF tool will run. It is configured to run on a private subnet, and to be provisioned using user data.

The user data script is provided in the `install.sh` file, and it contains all the necessary steps to setup the application in this cloud instance. Make sure that you replace EVERY placeholder within that install file with the appropriate values to your case. These are exactly the same ones that you would use to configure the `.env` files for both the client and the API. [Read more](https://www.cloudcarbonfootprint.org/docs/aws).

### EC2 Security Group

It allows traffic towards the CCF app running in the EC2 instance. Therefore, it specifies an ingress rule in the appropriate port. Make sure that if you want the app running on a different port, you should also change the `install.sh` to reflect that in the `PORT` variable.

### IAM policies and roles

They define the permissions needed to access the AWS services required by the CCF application (Athena, Glue, Cost Explorer, and S3).

### Elastic IP

We create an ElasticIP to be attached to the EC2 instance. This EIP will later be associated to the DNS record.

### Route53 DNS record

A DNS record within a private/public hosted zone that will allow to map a `HOST` name to the EIP private IP (your instance IP).

### S3 bucket

Necessary to do remote state management of Terraform state

### Diagram

<img title="CCF architecture" alt="CCF architecture" src="./img/architecture.png">

### Prerequisites

- Terraform >= 0.14.9 (tip: use [tfenv](https://github.com/tfutils/tfenv)) to manage multiple Terraform versions)

## How to use (basic step by step guide)

1. Make sure you have created an S3 bucket for the remote Terraform state file.
2. Go to `variables.tf` and replace all the placeholders applicable to your case e.g. `YOUR-DEFAULT-AWS-REGION`, `YOUR-KEY-PAIR`. If a variable doesn't apply to your case, delete it to keep things consistent e.g. `YOUR-VPN-SECURITY-GROUP-ID`
3. Repeat step 2 for the files: `terraform.tf`, `provider.tf`, `dns.tf`, and `data.tf`
4. Go to `install.sh` and replace all the placeholders that relate to the environment variables values that you configure for your client and the API. Make sure you complete the HOST and PORT variables as well if you're configuring a DNS record for the application. Delete them if not.
5. Change directory to the terraform directory and run `terraform init`
6. Run `terraform fmt`
7. Run `terraform validate` and make sure the configuration is valid 
8. Run `terraform plan` and `terraform apply` against your cloud provider

## Debugging

To work out if the `install.sh` script succeeds, you can SSH into the instance using the key pair specified in "key_name" variable (or connect via the AWS console), and tail the initialization logs with:

```
$ sudo su
$ tail -f /var/log/cloud-init-output.log 
```

## Other considerations

- You might not have access to apply Terraform infrastructure directly against your cloud. This has been tested as well with PR-based systems such as Atlantis, but might still need some tweaking on your part.

- The overall architecture might not suit your needs e.g. you might want the application running on an Internet facing compute instance, or you might not want to setup a domain name for it, etc. We understand there are multiple context specific needs that you can work out using this solution as a foundation.
