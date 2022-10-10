resource "aws_route53_record" "ccf" {
  name    = var.dns_name
  type    = "A"
  zone_id = var.hosted_zone_id

  alias {
    evaluate_target_health = false
    name                   = module.ccf_tool.ccf_lb_dns_name
    zone_id                = module.ccf_tool.ccf_lb_zone_id
  }
}
