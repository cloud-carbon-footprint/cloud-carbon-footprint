---
id: getting-started
title: Getting Started
---

There are two different ways to get started with Cloud Carbon Footprint:

- Recommended: Create a standalone app
- Contributors: Clone the Cloud Carbon Footprint repository

Creating a standalone app makes it simpler to customize the application for your needs and stay up to date with the project. You will depend on @cloud-carbon-footprint packages from npm, making your app much smaller. This is the recommended approach for most installations.

If you want to contribute to the project, it's easier to fork and clone the repository. The @cloud-carbon-footprint packages will be included in the clone. That will let you stay up to date with the latest changes, and give you an easier path to make Pull Requests.

### Prerequisites

- Git

- Node.js >= 12 (tip: use [nvm](https://github.com/nvm-sh/nvm) or [n](https://github.com/tj/n) to manage multiple Node versions)

- Yarn (latest)

## Create your Cloud Carbon Footprint App

We provide the @cloud-carbon-footprint/create-app package to scaffold standalone instances of Cloud Carbon Footprint.

Using npx you can then run the following to create an app in a chosen subdirectory of your current working directory:

```
npx @cloud-carbon-footprint/create-app
```

You can read more about this process in [Create an app](create-app).

## Contributing to Cloud Carbon Footprint

If you intend to make changes to the core project's packages or project documentation, then you can fork and clone https://github.com/cloud-carbon-footprint/cloud-carbon-footprint.

This will let you run the latest code off of the trunk branch, fix bugs or contribute new features, run test suites, etc.

You can read more about contributing to the project in our [CONTRIBUTING](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/CONTRIBUTING.md) guide.

In order to run Cloud Carbon Footprint locally, there are a few things you must do to get set up first.

### Clone the repository

```
git clone --branch latest https://github.com/cloud-carbon-footprint/cloud-carbon-footprint.git
cd cloud-carbon-footprint
```

### Guided Install

```
yarn guided-install
```

This will install dependencies for all packages, then guide you through setting up credentials and environment variables to analyze the footprint of your AWS, GCP, or Azure account. Then:

```
yarn start
```

If you have any problems with the guided install, you can instead choose to do a standard install.

### Standard Install

A standard install gives you more visibility and control around your particular setup.

```
yarn install
```

You can now continue by running with [mocked data](run-with-mocked-data) or [manually configuring your cloud providers](aws)

### Optional Prerequisites

- [Homebrew](https://brew.sh/) (to download the AWS CLI)

- AWS CLI `brew install awscli` (if you are authenticating with AWS - see below)

- Talisman (if you want to commit code)

        curl --silent https://raw.githubusercontent.com/thoughtworks/talisman/master/global_install_scripts/install.bash > /tmp/install_talisman.bash && /bin/bash /tmp/install_talisman.bash

Note:

- During install, Talisman may fail to add the pre-commit hook to this repository because one already exists for Husky. This is fine because it can still execute in the existing husky pre-commit hook, once installed.

- During install, Talisman will also ask you for the directory of your git repositories. If you don't want to install Talisman in all your git repos, then cancel out at this step.
