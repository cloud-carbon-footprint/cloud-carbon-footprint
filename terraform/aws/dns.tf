resource "aws_route53_record" "ccf-internal" {
  name    = var.dns_name
  records = [aws_eip.ccf.private_ip]
  ttl     = "300"
  type    = "A"
  zone_id = "YOUR-HOSTED-ZONE-ID"
}
