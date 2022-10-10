output "vpc_id" {
  value = aws_vpc.main.id
}

output "private_subnets" {
  value = values(aws_subnet.private)[*].id
}

output "public_subnets" {
  value = values(aws_subnet.public)[*].id
}

output "ccf_address" {
  value = module.ccf_tool.ccf_lb_dns_name
}
