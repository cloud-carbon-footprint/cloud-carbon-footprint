module "vpc" {
  source  = "terraform-google-modules/network/google"
  version = "~> 2.5"

  project_id   = var.project_id
  network_name = "cloud-carbon"
  routing_mode = "GLOBAL"

  subnets = [
    {
      subnet_name           = "subnet-01"
      subnet_ip             = "10.0.0.0/24"
      subnet_region         = var.region
    }
  ]

  routes = [
    {
      name                   = "egress-internet"
      description            = "route through IGW to access internet"
      destination_range      = "0.0.0.0/0"
      tags                   = "egress-inet"
      next_hop_internet      = "true"
    }
  ]
}

resource "google_compute_firewall" "allow_ssh" {
  name = "allow-ssh"
  network = module.vpc.network_name
  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags = ["server"]
}

resource "google_compute_firewall" "allow_server_ingress" {
  name = "allow-server-ingress"
  network = module.vpc.network_name
  allow {
    protocol = "tcp"
    ports    = ["4000"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags = ["server"]
}