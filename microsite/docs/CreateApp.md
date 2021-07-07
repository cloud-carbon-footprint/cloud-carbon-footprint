---
id: create-app
title: Create an App
---

Creating a Cloud Carbon Footprint App is a good way to quickly set up your own project.

Containing everything you need to run in your own environment, a Cloud Carbon Footprint App is a monorepo that is setup utilizing lerna.

If you wish to have more control over the configuration of the app and all of its packages or contribute to the Cloud Carbon Footprint project, you may want to [Run Cloud Carbon Footprint Locally](getting-started#configuring-the-app-locally) instead.

### Create an App

To create a Cloud Carbon Footprint app, you will need to have [Node.js](https://nodejs.org/en/download/) version >= 12 installed.

Creating a Cloud Carbon Footprint app guides you through the initial setup of selecting the name of the app.

The command to run the create app package using npx is:

```
npx @cloud-carbon-footprint/create-app
```

In the case that you would prefer to install the app yourself, you can run the same command with the following flag:

```
npx @cloud-carbon-footprint/create-app --skip-install
```

This will create a new Cloud Carbon Footprint App inside the current folder. The name of the app-folder is the name that was provided when prompted.

Inside that directory, it will generate all the files and folder structure needed for you to run your app.

### General folder structure

Below is a simplified layout of the files and folders generated when creating an app.

```
app
├── tsconfig.json
├── prettierrc.json
├── lerna.json
├── package.json
└── packages
  ├─ api
  ├─ cli
  └──client
```

- tsconfig.json: Contains information about typescript configuration needed for the monorepo setup.
- prettierrc.json: Contains information about prettier configuration needed for the monorepo setup.
- lerna.json: Contains information about workspaces and other lerna configuration needed for the monorepo setup.
- package.json: Root package.json for the project. Note: Be sure that you don't add any npm dependencies here as they probably should be installed in the intended workspace rather than in the root.
- packages/: Lerna leaf packages or "workspaces". Everything here is going to be a separate package, managed by lerna.
- packages/api/: The API endpoint as an entrypoint to get cloud energy and carbon emissions. Optionally used by the client dashboard.
- packages/cli/: Command Line Interface as an entrypoint to get cloud energy and carbon emissions.
- packages/client/: The front-end dashboard for Cloud Carbon Footprint.

### Install and Start the App

When the installation is complete you can open the app folder to start the configuration process.

```
cd my-ccf-app
yarn guided-install
```

Note: If you used the `--skip-install` flag, you will need to run `yarn install` before running `yarn guided-install`.

The `yarn guided-install` command will lead you through a guided installation as referenced [here](gettingstarted#standard-install). You can also choose to configure your app manually as referenced [here](aws).

Once you are finished with the installation you are ready to start the application!

```
yarn start
```

Open a browser and directly navigate to the frontend at `http://localhost:3000`.

Now you're free to start your own Cloud Carbon Footprint application! Happy Hacking!

### Linking in local Cloud Carbon Footprint packages

Since the `@cloud-carbon-footprint/app` and  `@cloud-carbon-footprint/common` packages are used as a dependencies for packages in your Cloud Carbon Footprint App, the packages will not be accessible for any modifications. Since these packages contain the core logic to get cloud usage data and estimate energy and carbon emissions, you may find yourself wanting to update the emissions factors, coefficients, or any other calculations. Fortunately, by linking them as external packages, you will be able to make modifications and test out the changes locally!

You will notice that in the create-app template files, the app and common packages are the only external dependencies used. The app package in turn depends on the aws, gcp and azure packages.
Each of the cloud provider packages also depend on the core package. In these packages is where most of the core logic of our application is specifically located and these can all be externally linked for modification as well.

To do this, you will first need to clone the [Cloud Carbon Footprint App](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint). Then you will need to modify your package.json and lerna.json workspace paths. You can either add relative or absolute paths with or without globs. For example:

In the package.json file in the root of your Cloud Carbon Footprint App:

```
"workspaces": {
  "packages": [
    "packages/*",
    "../cloud-carbon-footprint/packages/core"
    "../cloud-carbon-footprint/packages/app",
    "../cloud-carbon-footprint/packages/common",
    "../cloud-carbon-footprint/packages/aws",
    "../cloud-carbon-footprint/packages/gcp",
    "../cloud-carbon-footprint/packages/azure"
  ]
}
```

And in the lerna.json file in same directory:

```
"packages": [
  "packages/*",
  "../cloud-carbon-footprint/packages/core",
  "../cloud-carbon-footprint/packages/app",
  "../cloud-carbon-footprint/packages/common",
  "../cloud-carbon-footprint/packages/aws",
  "../cloud-carbon-footprint/packages/gcp",
  "../cloud-carbon-footprint/packages/azure"
]
```

Then reinstall packages to make yarn set up symlinks by running `yarn install` in the root directory.

Now you should be able to modify any of the external packages within the main repository that you cloned, and have those changes be reflected in your app!

### Keeping Cloud Carbon Footprint Updated

Cloud Carbon Footprint has constant improvements being made each day, so we recommend staying up to date with the latest releases. The `@cloud-carbon-footprint/create-app` tool can be considered a good starting point for a continuously evolving application.

#### Updating Cloud Carbon Footprint versions

Currently, when you create a Cloud Carbon Footprint app using the create-app package, there are a couple package dependencies which are `@cloud-carbon-footprint/app` and `@cloud-carbon-footprint/common`.
The command used to bump the package dependencies to the latest version is:

```
yarn up @cloud-carbon-footprint/app
```
and / or
```
yarn up @cloud-carbon-footprint/common
```

Please note that depending on the current version of the app or common package, the update command may only update it to the next highest minor version as referenced [here](https://classic.yarnpkg.com/en/docs/dependency-versions/#toc-caret-ranges). Beware that once the app or common package is `>= v1.0.0`, running the command will update to the latest package with breaking changes.

#### Following create-app template changes

The `@cloud-carbon-footprint/create-app` command will create the initial base structure of your Cloud Carbon Footprint installation from a template. The source of this template in the Cloud Carbon Footprint repository is updated periodically, but when you use the create-app command, your local app and packages won't automatically get these template updates.

Any changes made to the template are documented along with upgrade instructions in the [changelog](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/create-app/CHANGELOG.md) of the `@cloud-carbon-footprint/create-app` package. In order to see if there might be any applicable updates when upgrading packages, it is recommended to regularly take a look at this changelog.
