data "google_service_account" "gcp2aws" {
  account_id = "gcp2aws"
}

resource "google_compute_instance" "server" {
  machine_type = var.server_instance_type
  name = "server"
  boot_disk {
    initialize_params {
      image =  "${var.project_id}/docker-awscli"
    }
    auto_delete  = true
  }
  
  service_account {
    scopes = ["cloud-platform"]
    email = data.google_service_account.gcp2aws.email
  }

  network_interface {
    network = module.vpc.network_name
    subnetwork = module.vpc.subnets_names[0]
    access_config {}
  }

  metadata_startup_script = templatefile("templates/launch.sh.tpl", {
    server_version = var.server_version,
    client_version = var.client_version
  })

  tags = ["server"]
}

output "instance_ip" {
  value = google_compute_instance.server.network_interface.0.access_config.0.nat_ip
}