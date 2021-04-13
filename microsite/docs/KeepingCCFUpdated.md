---
id: keeping-ccf-updated
title: Keep Cloud Carbon Footprint Updated
---

Cloud Carbon Footprint is always improving, so it's a good idea to stay in sync with the latest releases. Cloud Carbon Footprint is more of a library than an application or service; similar to create-react-app, the `@cloud-carbon-footprint/create-app` tool gives you a starting point that's meant to be evolved.

### Updating Cloud Carbon Footprint versions

Currently, when you create a Cloud Carbon Footprint app using the create-app package, there is only one package dependency which is `@cloud-carbon-footprint/core`
The command to used to bump the core package dependency to the latest version is:

```
yarn up @cloud-carbon-footprint/core
```

Please note that depending on the current version of the core package, the update command may only update it to the next highest minor version as referenced [here](https://classic.yarnpkg.com/en/docs/dependency-versions/#toc-caret-ranges). Beware that once the core package is `>= v1.0.0`, running the command will update to the latest core package with breaking changes.

### Following create-app template changes

The `@cloud-carbon-footprint/create-app` command creates the initial structure of your Cloud Carbon Footprint installation from a template. The source of this template in the Cloud Carbon Footprint repository is updated periodically, but your local app and backend packages are established at create-app time and won't automatically get these template updates.

For this reason, any changes made to the template are documented along with upgrade instructions in the [changelog](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/create-app/CHANGELOG.md) of the `@cloud-carbon-footprint/create-app` package. We recommend peeking at this changelog for any applicable updates when upgrading packages.
