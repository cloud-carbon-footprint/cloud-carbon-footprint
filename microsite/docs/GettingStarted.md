---
id: getting-started
title: Getting Started
---

In order to run Cloud Carbon Footprint locally, there are a few things you must do to get set up first.

### Prerequisites

- Git

- Node.js >= 12 (tip: use [nvm](https://github.com/nvm-sh/nvm) or [n](https://github.com/tj/n) to manage multiple Node versions)

- Yarn (latest)

### Clone the repository

```
git clone --branch latest https://github.com/cloud-carbon-footprint/cloud-carbon-footprint.git
cd cloud-carbon-footprint
```

### Guided Install

```
yarn install && yarn guided-install
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
