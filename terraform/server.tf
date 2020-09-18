data "google_service_account" "gcp2aws" {
  account_id = "gcp2aws"
}

resource "google_compute_instance" "server" {
  machine_type = var.server_instance_type
  name = "server"
  boot_disk {
    initialize_params {
      image =  "${var.project_id}/chatbot"
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
    server_version = var.server_version
  })

  tags = ["server"]
}