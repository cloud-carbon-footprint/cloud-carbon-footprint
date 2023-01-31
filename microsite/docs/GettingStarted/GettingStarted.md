---
id: getting-started
title: Getting Started
slug: /getting-started
sidebar_position: 2
---

There are three different ways to get started with Cloud Carbon Footprint:

- Create a standalone app using the command line interface
- Clone the Cloud Carbon Footprint repository
- Run Cloud Carbon Footprint in an ephemeral workspace with a hosted development environment provider

For the best way of staying up to date with the project, you can create a standalone app for simple customization according to your needs. This method uses the @cloud-carbon-footprint packages as npm dependencies, making for a more lightweight standalone app.

Forking and cloning the repository is the best way to contribute to the project. Cloning the project will include all of the @cloud-carbon-footprint packages for local development and configuration. This path offers the option to create Pull Requests and to stay up to date with the latest changes.

If you want to run project in a disposable development environment to see how Cloud Carbon Footprint works, and make changes, you can spin up an environment with Gitpod, a hosted service. This will be running a development environment on _Gitpod's_ infrastructure - bear this in mind when testing it out with any cloud provider credentials.

### Prerequisites

- Git

- Node.js [Active LTS Release](https://nodejs.org/en/blog/release/) (tip: use [nvm](https://github.com/nvm-sh/nvm) or [n](https://github.com/tj/n) to manage multiple Node versions)

- Yarn (latest)

## Create your Cloud Carbon Footprint App

We provide the @cloud-carbon-footprint/create-app package to create standalone instances of Cloud Carbon Footprint.

This option offers a quick setup, but has @cloud-carbon-footprint packages as dependencies. This means you will inherit the core estimation logic, but will have less freedom over customizing that logic. If you want to explore linking in local Cloud Carbon Footprint packages to your created app, you can refer to [this section](CreateApp.md#linking-in-local-cloud-carbon-footprint-packages).

Using npx, you can then run the following command to create an app within your current working directory:

```
npx @cloud-carbon-footprint/create-app
```

You can read more about this process in [Create an app](CreateApp.md).

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

A standard installation gives you more visibility and control around your particular setup.

```
yarn install
```

You can now continue by running with [mocked data](RunWithMockedData.md) or [manually configuring your cloud providers](GettingStartedIntro.md#connecting-your-data)

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


## Run Cloud Carbon Footprint in an ephemeral workspace

If you want to spin up an temporary development environment for Cloud Carbon Footprint, you can use Gitpod, an open source service for creating disposable environments to work on software projects.

### Using the hosted service

If you have an account on https://gitpod.io, you can open a workspace for the cloud carbon footprint project by following the link in your browser of the form `https://gitpod.io/#project-url-on-github`

So for Cloud Carbon Footprint, you would visit:

https://gitpod.io/#https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/

This will run through the steps outlined in the documentation below and install the necessary dependencies for the project, then open an instance of VS Code in your browser that you can work on immediately.

If you want to check out a specific branch, or open a workspace for specific pull request or issue, add the full url for the issue or pull request you are interested in. A workspace will be created with the corresponding branch already checked out, that you can share with others to pair in, and use git to commit changes, before pushing your changes to the relevant the branch. 

https://gitpod.io/#https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/pull/513
https://gitpod.io/#https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/tree/recs-filter

Shortly after you close the browser tab for your workspace, Gitpod will tear down and delete the workspace. For more information, please consult the [Gitpod docs](https://www.gitpod.io/docs/)

### Using a self-hosted instance of gitpod

If you need to, you can run also run Gitpod on your own infrastructure, and use it to connect to source code repositories other than GitHub. [Doing so is well documented](https://www.gitpod.io/docs/self-hosted/latest), but beyond the scope of the docs for this project.

