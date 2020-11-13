# Contributing to cloud-carbon-footprint

## Linting
- We are using `eslint` and `prettier` in the project
- To avoid the hassle of manually linting the file, you can configure your IDE to automatically run the
linter.
- If you are using Webstorm, check out [this](https://prettier.io/docs/en/webstorm.html) guide on how to 
   set it up
- The prettier rules set up for the project are in `.prettierrc.json` file in the root DIR. 
- THe client and the server have their own ESLint rules in the respective `.eslintrc.js` files. 
- Following the above rules is a pre-requisite for committing any code.

## To commit and push

To push to `trunk`:

1. Make your changes on the `trunk` branch.
1. Stage your changes: `git add [your changed files]`.
1. Commit your changes with this message format: `git commit -m "[ticket number] - Your commit message | Your name, Pair's name`.
1. The pre-commit hook should run the linter, formatter, and tests for your _changed_ files. The hook will commit the changes when the pre-commit check passes.
1. Rebase `trunk`: `git pull -r`
1. Lint and test the entire codebase from the root directory: `npm run lint && npm test`.
1. Run the app from the root directory to ensure it starts: `npm start`.
1. Push to remote: `git push origin HEAD:trunk`.

Check the [CI pipeline builds](https://app.circleci.com/pipelines/github/twlabs/cloud-carbon-footprint)

- If the build <span style="color:green">passes</span>, you're done!
- If the build <span style="color:red">fails</span>, click the link highlighted below to read the errors, fix the issue, and commit/push the fix by following the instructions above

## To run all tests

- Run `npm test` from the root directory.
- If you are missing a test file in the coverage report, you may need to clear the test cache by running 
  `npm run test:clean` from the client and / or server DIR.
  
  This is also one of the pre-commit hook but it is also advisable to run it at least once a week.

## Bundle size analysis
 From the client folder 
- Run `npm run build -- --stats ` then 
- Run ` npx webpack-bundle-analyzer build/bundle-stats.json `

The above commands might be added to the package.json if we are so inclined

This will help in visualizing the bundle size, seeing bundles that might not be required in production, etc,.

## CI Pipeline

We use CircleCI for our pipeline. [Link to pipeline](https://app.circleci.com/pipelines/github/twlabs/cloud-carbon-footprint).

You can learn more about CircleCI in the [CircleCI Documentation](https://circleci.com/docs/)
  
## Package management

- We use NPM for package management.
- To install a new package, use `npm install --save package-name` (production) or `npm install --save-dev package-name` (development) inside either the client or server directory.
- Use `npm run bootstrap` at the root directory to have all packages freshly installed. 
- Alternatively, run `npm ci` in the client and server directory.

### Updating Packages
- To update a package to the patch or minor version, use the command `npm update <package-name>`
- To update a package to the latest major version, use `npm install <package-name>@latest`

## Module Aliasing

We've set up module aliasing within the server package, so modules within the sub directories can be accessed with the @ prefix, e.g. @application/Module/. We implemented this by configuring tsconfig.json, jest.config.js and installing the `tsconfig-paths` package.

## Lightweight ADR's (Architectural Decision Records)

We record any significant architectural choices we make with lightweight adr files, located in the .adr folder. There is a template included as well. For more information about Lightweight ADR's, see [ThoughtWork's Technology Radar](https://www.thoughtworks.com/radar/techniques/lightweight-architecture-decision-records).

## Hawkeye
- Used to check node packaging and vulnerability
- This will run along every pre-commit hook
- to run isolated, cd into server or client and run: `npx hawkeye scan`
- You can learn more about Hawkeye [here](https://github.com/hawkeyesec/scanner-cli)

## Talisman
- Used to check for potential secrets or sensitive information 
- This will run along every pre-commit hook
- You can learn more about Talisman [here](https://github.com/thoughtworks/talisman)

## Logging
- We are using [Winston](https://github.com/winstonjs/winston) for logging locally and Google's [logging-winston](https://github.com/googleapis/nodejs-logging-winston) for Logging in Google App Engine.
- The LOGGING_MODE can set inside the server/.env file, but by default it should be unset for local development.  
- server/logs contain the log files that written to by the logger. This should be deleted occasionally, otherwise it will become unnecessarily large.
 
## Webstorm IDE Development Configurations
-  Open the TypeScript tool window (View | Tool Windows | TypeScript) and switch to the Errors tab.
The tab lists the discrepancies in the code detected by the TypeScript Language Service. The list is updated dynamically as you change your code for easier and faster debugging.  

- You can also monitor compilation errors by going to the TypeScript tool window (View | Tool Windows | TypeScript),
and switching to the Compile errors tab which shows up only after first manual compilation, when you click the :hammer: button and select the compilation scope.

#### Cleaning up Local
 - server/logs contain the log files that written to by the logger. This should be deleted occasionally, otherwise it will 
 become infinitely large.
 
 - Delete estimate.cache.json to pull new data when testing to get most up to date data and verify querying is working 
 as expected 

## VSCode IDE Development Configurations
- To run test on IDE, install the extension, `Jest Runner`, from marketplace
 
## Troubleshoot

### Cloud Provider

#### GCP
If GCP credentials are not linked properly, there may be an error regarding AWS credentials not being set properly. This
has been caused by either out of date credentials on GCP, or the GCP credentials not being set properly on the local environment

### Talisman
#### Installing
- If you are receiving the following error, you may have installed Talisman wrong 
`sh: /talisman_hook_script: No such file or directory error.`
- To resolve check your env var by `echo $TALISMAN_HOME`, if it is installed correctly it will echo out a 
path `/Users/username/.talisman/bin`. If not, please refer to the README.md for instructions to install talisman
- If this variable is set, check to make sure you have the /talisman_hook_script within that directory

#### Overwritting Checks
- If there is an invalid check from Talisman, the failed commit will contain a checksum that you can add to 
the .talismanrc, which will allow it to pass for that commit.
- However this checksum is only valid for that specific commit, if the file changed, and it has a talisman check, it 
will run a new checksum for the .talismanrc that will have to be updated

### CircleCI
- Sometimes the CircleCI build fails due to a `ENOMEM: not enough memory, read` error. This is a transient error and you can just restart the build from the last failed job.   

## Architecture Diagrams

![Data-Diagram](/Dataflow-diagram.png)

### Tech Stack and Development Tools

![tech-stack](/Tech-Stack.png)

© 2020 ThoughtWorks, Inc. All rights reserved.
