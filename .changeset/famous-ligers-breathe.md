---
'@cloud-carbon-footprint/client': patch
'@cloud-carbon-footprint/create-app': patch
'@cloud-carbon-footprint/gcp': patch
---

updates GCPAccount to use MIN_WATTS_MEDIAN and MAX_WATTS_MEDIAN to compute estimations actually work. Updates client to not break when cost is zero

please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/0cdcd2c5ab0b68a69374b31b32c10721fb8f094a) for create-app package updates.


