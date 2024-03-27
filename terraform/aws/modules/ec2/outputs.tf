output "ccf_port" {
  value = var.application_port
}

output "ccf_instance_ids" {
  value = data.aws_instances.main.ids
}

output "ccf_lb_dns_name" {
  value = aws_lb.alb.dns_name
}

output "ccf_lb_zone_id" {
  value = aws_lb.alb.zone_id
}
