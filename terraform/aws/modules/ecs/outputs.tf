output "ccf_api_port" {
  value = var.ccf_api_container_port
}

output "ccf_client_port" {
  value = var.ccf_client_container_port
}

output "ccf_lb_dns_name" {
  value = aws_lb.alb.dns_name
}

output "ccf_lb_zone_id" {
  value = aws_lb.alb.zone_id
}
