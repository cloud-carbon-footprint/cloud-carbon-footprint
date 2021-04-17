---
id: getting-started
title: Getting Started
---

There are two different ways to get started with Cloud Carbon Footprint:

- Create a standalone app using the command line interface
- Clone the Cloud Carbon Footprint repository

For the best way of staying up to date with the project, you can create a standalone app for simple customization according to your needs. This method uses the @cloud-carbon-footprint packages as npm dependencies, making for a more lightweight standalone app.

Forking and cloning the repository is the best way to contribute to the project. Cloning the project will include all of the @cloud-carbon-footprint packages for local development and configuration. This path offers the option to create Pull Requests and to stay up to date with the latest changes.

### Prerequisites

- Git

- Node.js >= 12 (tip: use [nvm](https://github.com/nvm-sh/nvm) or [n](https://github.com/tj/n) to manage multiple Node versions)

- Yarn (latest)

## Create your Cloud Carbon Footprint App

We provide the @cloud-carbon-footprint/create-app package to create standalone instances of Cloud Carbon Footprint.

This option offers a quick setup, but has @cloud-carbon-footprint packages as dependencies. This means you will inherit the core estimation logic, but will have less freedom over customizing that logic. If you want to explore linking in local Cloud Carbon Footprint packages to your created app, you can refer to [this section](create-app#linking-in-local-cloud-carbon-footprint-packages).

Using npx, you can then run the following command to create an app within your current working directory:

```
npx @cloud-carbon-footprint/create-app
```

You can read more about this process in [Create an app](create-app).

## Configuring the App Locally

This option has more visibility and control over configuring the application, but requires a more manual setup process than using the create-app command.

You can fork and clone https://github.com/cloud-carbon-footprint/cloud-carbon-footprint in order to make changes to the core project's packages or project documentation.

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
yarn install && yarn guided-install
```

This will install dependencies for all packages, then guide you through setting up credentials and environment variables to analyze the footprint of your AWS, GCP, or Azure account.

If you have any problems with the guided install, you can instead choose to do a standard install.

### Standard Install

A standard install gives you more visibility and control around your particular setup.

```
yarn install
```

You can now continue by running with [mocked data](run-with-mocked-data) or [manually configuring your cloud providers](aws)

### Starting the App

Now you can start the app using:

```
yarn start
```

As you get more experienced with the app, in future you can run just the frontend with `yarn start-client` in one window, and the backend with `yarn start-api` in a different window.

### Optional Prerequisites

- [Homebrew](https://brew.sh/) (to download the AWS CLI)

- AWS CLI `brew install awscli` (if you are authenticating with AWS - see below)

- Talisman (if you want to commit code)

        curl --silent https://raw.githubusercontent.com/thoughtworks/talisman/master/global_install_scripts/install.bash > /tmp/install_talisman.bash && /bin/bash /tmp/install_talisman.bash

Note:

- During install, Talisman may fail to add the pre-commit hook to this repository because one already exists for Husky. This is fine because it can still execute in the existing husky pre-commit hook, once installed.

- During install, Talisman will also ask you for the directory of your git repositories. If you don't want to install Talisman in all your git repos, then cancel out at this step.
