## Updating the Templates

This package includes a default-app template with packages referenced from those that are periodically updated in the cloud-carbon-footprint repo. However the local packages are established at create-app time and won't automatically get these updates. For this reason, each time a release is made and Cloud Carbon Footprint package version updates are published, the create-app template should be updated and the changes should be documented along with upgrade instructions in the [CHANGELOG](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/packages/create-app/CHANGELOG.md) file using changesets.

## Testing Create-app Updates

*NOTE*: If you would like access to contribute to create-app development and have access to publish new versions to npm repository, please contact a green-cloud member.

###Process:

From the root directory, you can run `yarn test-create-app`. This will subsequently trigger the following:
- The create-app package.json is updated to change the name of the package to append `-dev`. The current version of the published @cloud-carbon-footprint/create-app-dev is grabbed, and the package.json is modified to change the version to the next patch number higher.
- A ‘yarn install’ takes place in the root to resolve workspaces
- The create-app package with the modified name and version is then built and you will be prompted to login to NPM and the package will be published to the npm registry
- The newly published create-app-dev package is then installed
- When prompted to name the newly created app, you must enter `ccf-app`. This is imperative or else the rest of the script will fail.
- The new app will be created within the create-app directory and the app will automatically start with the script `yarn start-with-mock-data`.
- The create-app package.json is then cleaned up to revert back to the original.
- Now you are able to confirm that the app runs and performs as expected.

*NOTE*: This check will not confirm that the `cli` and `api` functionality is working properly. To check this you will need to close out the app started with mock data and:
Copy over the .env file from the main api/cli packages into the new ‘ccf-app’ api/cli packages.
Try starting up either the api or cli to retrieve data and confirm they are working as expected.
This process should only need to occur if the create-app templates have been updated for cli or api.
In order for this test to work in the future, you will need to delete the new `ccf-app` from the directory. The script will not be able to override the name and will fail.
Once the testing process is completed, you should run another `yarn install` to resolve all the workspaces

You are now ready to create a new changeset and publish the create-app package!


## License

© 2021 Thoughtworks, Inc.
