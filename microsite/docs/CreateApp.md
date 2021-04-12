---
id: create-app
title: Create an App
---

To get set up quickly with your own project you can create a Cloud Carbon Footprint App.

A Cloud Carbon Footprint App is a monorepo setup with lerna that includes everything you need to run Cloud Carbon Footprint in your own environment.

If you intend to develop a plugin or contribute to the Cloud Carbon Footprint project, you may want to [Run Cloud Carbon Footprint Locally](runninglocallyintro) instead.

### Create an App

To create a Cloud Carbon Footprint app, you will need to have [Node.js](https://nodejs.org/en/download/) version >= 12 installed.

Cloud Carbon Footprint provides a utility for creating new apps and it guides you through the initial setup of selecting the name of the app.

The easiest way to run the create app package is with npx:

```
npx @cloud-carbon-footprint/create-app
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

When the installation is complete you can stop the running node (`^c`) and open the app folder to start the installation process.

```
cd my-ccf-app
yarn install && yarn guided-install
```

The `yarn guided-install` command will lead you through a guided installation as referenced [here](gettingstarted#standard-install). You can also choose to only `yarn install` and then configure your app manually as referenced [here](aws).

Once you are finished with the installation you are ready to start the application!

```
yarn start
```

Open a browser and directly navigate to the frontend at `http://localhost:3000`.

Now you're free to hack away on your own Cloud Carbon Footprint installation!

As you get more experienced with the app, in future you can run just the frontend with `yarn start-app` in one window, and the backend with `yarn start-api` in a different window.
