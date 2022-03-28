---
'@cloud-carbon-footprint/client': major
'@cloud-carbon-footprint/create-app': major
---

Updates CCF Client to allow for publishable component libraries (Backstage Plugin Compatibility)

**Breaking Changes**: This update contains important refactors to the client package which includes updating the build script to build the new component library, changes to the service hooks, as well as adding better error handling for api calls.

For update to the create-app templates, please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/7a6457bd9de48ffdfccca4232a1f8b744efd9be1) (includes necessary major client changes).
