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
