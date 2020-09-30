provider "google" {
  project     = var.project_id
  region      = var.region
  zone        = var.zone
}

 terraform {
   required_version = "0.12.28"
   backend "gcs" {
   }
 }

resource "google_app_engine_application" "app" {
  project     = var.project_id
  location_id = "us-west2"
}