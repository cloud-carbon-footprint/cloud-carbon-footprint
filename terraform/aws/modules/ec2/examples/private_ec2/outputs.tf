output "vpc_id" {
  value = aws_vpc.main.id
}

output "ccf_address" {
  value = module.ccf_tool.ccf_lb_dns_name
}
