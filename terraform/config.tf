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

# this was imported, so the location_id was already set and we can't change it
resource "google_app_engine_application" "app" {
  project     = var.project_id
  location_id = "us-west2"
}