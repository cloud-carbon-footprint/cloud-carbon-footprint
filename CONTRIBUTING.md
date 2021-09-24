# Contributing to cloud-carbon-footprint

## Issues ​⛔

Issues are created [here](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/issues).

Issues will be closed if they have been inactive and the latest affected version no longer receives support.

_If an issue has been closed and you still feel it's relevant, feel free to ping a maintainer or add a comment!_

## Picking Up an Issue
We aim to be transparent in the work we are doing and have it posted on the [project board](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/projects/1).
If a particular card interests you, feel free to comment on it to inform us you'd like to collaborate so we can begin conversations about it.
Cards in the `Ready to Do` are properly prepared to be worked on.
If a card has the marker `Good First Issue`, it is a great option to start with. Please indicate via a comment in the card that you are working on it, and we will assign it to you and move it into the `In Progress` column. When you have finished, please submit a PR and we will review and merge it.
Cards without the `Good First Issue` marker are generally on our team's roadmap, but if you'd like to contribute that work, please comment on the ticket for alignment. Once you get to the point of working on the issue, please [submit a PR with your changes and link it to the issue.](#pull_requests)

### How to Contribute in Issues

There are fundamentally three ways an individual can contribute:

1. **Open an issue:** If you believe that you have found a new bug or have a feature addition or request, you should report it by creating a new issue in the `cloud-carbon-footprint/cloud-carbon-footprint` issue tracker.
1. **Help triage an open issue:** You can do this either by providing assistive details (a reproducible test case that demonstrates a bug) or by providing suggestions to address the issue.
1. **Resolve an open issue:** This can be done by demonstrating that the issue is not a bug or is fixed; but more often, by opening a pull request that changes the source in `cloud-carbon-footprint/cloud-carbon-footprint` in a concrete and reviewable manner.

### Asking for General Help

- Please join our [Google Group](https://groups.google.com/g/cloud-carbon-footprint) and post a message with your question.

### Submitting a Bug Report

To submit a bug report:

When opening a new issue in the `cloud-carbon-footprint/cloud-carbon-footprint` issue tracker, users will be presented with a [bug report template](/.git/ISSUE_TEMPLATE/Bug_report.md) that should be filled in.

If you believe that you have found a bug in the cloud-carbon-footprint, please fill out the given template to the best of your ability.

### Triaging a Bug Report

It's common for open issues to involve discussion. Some contributors may have differing opinions, including whether the behavior is a bug or feature. This discussion is part of the process and should be kept focused, helpful, and professional.

Terse responses that provide neither additional context nor supporting detail are not helpful or professional. To many, such responses are annoying and unfriendly.

Contributors are encouraged to solve issues collaboratively and help one another make progress. If you encounter an issue that you feel is invalid, or which contains incorrect information, explain why you feel that way with additional supporting context, and be willing to be convinced that you may be wrong. By doing so, we can often reach the correct outcome faster.

### Resolving a Bug Report

Most issues are resolved by opening a pull request. The process for opening and reviewing a pull request is similar to that of opening and triaging issues, but carries with it a necessary review and approval workflow that ensures that the proposed changes meet the minimal quality and functional guidelines of the cloud-carbon-footprint project.

---

## <a id="pull_requests"></a>Pull Requests 📥

Pull Requests are the way concrete changes are made to the code, documentation, dependencies, and tools contained in the `cloud-carbon-footprint/cloud-carbon-footprint` repository. Please [link your PR](https://docs.github.com/en/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue) to an issue so we can more easily track the work being done

## Setting up your local environment

### Fork & Clone

Fork the project on GitHub and clone your fork locally.

```
$ git clone git@github.com:[your-username-here]/cloud-carbon-footprint.git
$ cd cloud-carbon-footprint
$ git remote add upstream https://github.com/cloud-carbon-footprint/cloud-carbon-footprint
$ git fetch upstream
```

### Build

See the [main repository README](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/README.md) for build directions.

### Branch

The Thoughtworks Cloud Carbon Footprint team uses [Trunk-Based Development](https://www.thoughtworks.com/insights/blog/enabling-trunk-based-development-deployment-pipelines).
You're welcome to keep your local development environment organized as you like, however when submitting pull requests to the base repository, be sure to submit them against the `trunk` branch. In order to avoid merge conflicts in your pull request, you'll need to successfully rebase ahead of your pull request:

```
$ git fetch upstream
$ git rebase upstream/trunk
$ git push origin/trunk
```

### Code

Most pull requests opened against the `cloud-carbon-footprint/cloud-carbon-footprint` repository include changes to either the Typescript/React code in the client/ folder, the Typescript code in the packages/api/ folder or the documentation.

#### Linting

- We are using `eslint` and `prettier` in the project
- To avoid the hassle of manually linting the file, you can configure your IDE to automatically run the
  linter.
- If you are using Webstorm, check out [this](https://prettier.io/docs/en/webstorm.html) guide on how to
  set it up
- The prettier rules set up for the project are in `.prettierrc.json` file in the root DIR.
- The client and the server have their own ESLint rules in the respective `.eslintrc.js` files.
- Following the above rules is a pre-requisite for committing any code.

#### Testing

##### Unit Testing

- Run `yarn test` from the root directory.
- If you are missing a test file in the coverage report, you may need to clear the test cache by running
  `yarn test:clean` from the client and / or server DIR.

##### Integration Testing

- Run either `yarn headless` or `yarn headed` from the `integration_tests` directory. Running `yarn headed` will run the tests with chrome browsers.
- If using macOS Catalina or later, in order to run the tests properly, you will need to open your `System Preferences`, navigate to `Security & Privacy`, select `Screen Recording` from the menu and then check `TestCafe Browser Tools`.

These are also part of the pre-commit hook but it is also advisable to run tests regularly.

### Commit

It is recommended to keep your changes grouped logically within individual commits. Many contributors find it easier to review changes that are split across multiple commits. There is no limit to the number of commits in a pull request. Please be sure to include your issue number in brackets and use easy to understand commit messages that summarize the work that you've done. A good commit message should describe what changed and why. See example below as reference.

```
$ git commit -m "[issue-number] Adds support for estimating Azure Anomoly Detector carbon emissions"
```

_Please Note_ We have configured the repository to run secrets scanning (Talisman), dependency version check, tests and linting with a pre-commit hook. It is recommended you ensure this pre-commit hook is properly set up in your local environment, and to only commit from the command line to ensure that it runs.

### Rebase

Once you have committed your changes, it is a good idea to use git rebase (not git merge) to synchronize your work with the main repository.

```
$ git fetch upstream
$ git rebase upstream/trunk
```

This ensures that your working branch has the latest changes from `cloud-carbon-footprint/cloud-carbon-footprint` trunk.

### Test

While our tests run every time you commit thanks to the pre-commit hook described above, if you would like to run the tests idependant of a commit, use the following:

```
$ yarn test
```

### Changeset Version Update

Once you have commited your changes. run `yarn changeset` from the root directory. You will be prompted to choose which packages that need to be updated using the arrow keys and space bar. You will need to choose the appropriate update for each package that you have contributed to using the guidelines set with [Semantic Versioning](https://semver.org/). You will also be prompted to leave a detailed description of your changes. This process will create a markdown file in the .changesets directory to be included in your commit and pushed. Changesets are only requested if you made an update to any of the packages.

### Push

Once your commits are ready to go -- with passing tests and linting -- begin the process of opening a pull request by pushing your working branch to your fork on GitHub.

```
$ git push origin my-branch
```

### Opening the Pull Request

From within GitHub, opening a new pull request will present you with a [template](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/.github/PULL_REQUEST_TEMPLATE.md) that should be filled out:

### Discuss and Update

You will probably get feedback or requests for changes to your pull request. This is a big part of the submission process so don't be discouraged! Some contributors may sign off on the pull request right away. Others may have detailed comments or feedback. This is a necessary part of the process in order to evaluate whether the changes are correct and necessary.

To make changes to an existing pull request, make the changes to your local branch, add a new commit with those changes, and push those to your fork. GitHub will automatically update the pull request.

```
$ git add my/changed/files
$ git commit
$ git push origin my-branch
```

There are a number of more advanced mechanisms for managing commits using git rebase that can be used, but are beyond the scope of this guide.

Feel free to post a comment in the pull request to ping reviewers if you are awaiting an answer on something.

---

## Bundle size analysis 🔍

From the client folder

- Run `yarn build -- --stats ` then
- Run `yarn webpack-bundle-analyzer build/bundle-stats.json`

The above commands might be added to the package.json if we are so inclined

This will help in visualizing the bundle size, seeing bundles that might not be required in production, etc,.

---

## Continuous Integration Pipeline 🔁

We use Github Actions for our CI pipeline. [Link to pipeline](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/actions/workflows/ci.yml).

You can learn more about Github Actions in the [Github Actions Documentation](https://docs.github.com/en/actions)

---

## Approval for Production

When pushing up, Github Actions will automatically go through the steps of deploying to staging as long as all tests and linting past.

To deploy to production, go to Github Actions and view the CI workflow to deploy. It is a manual approval, therefore if it is ready to be
pushed into production, click on "Review deployments", select production, then approve the deployment.

---

## Package management 📦

- We use yarn for package management.
- To install a new package, use `yarn add package-name` (production) or `yarn add --dev package-name` (development) inside either the client or server directory.
- Use `yarn install` at the root directory to have all packages freshly installed.

### Updating Packages

- To update a package to the patch or minor version, use the command `yarn update <package-name>`
- To update a package to the latest major version, use `yarn upgrade --latest <package-name>`

---

## Lightweight ADR's (Architectural Decision Records) 📄

We record any significant architectural choices we make with lightweight adr files, located in the .adr folder. There is a template included as well. For more information about Lightweight ADR's, see [ThoughtWork's Technology Radar](https://www.thoughtworks.com/radar/techniques/lightweight-architecture-decision-records).

---

## Talisman 💍

- Used to check for potential secrets or sensitive information
- This will run along every pre-commit hook
- You can learn more about Talisman [here](https://github.com/thoughtworks/talisman)

---

## Logging

- We are using [Winston](https://github.com/winstonjs/winston) for logging locally and Google's [logging-winston](https://github.com/googleapis/nodejs-logging-winston) for Logging in Google App Engine.
- The LOGGING_MODE can set inside the api/.env file, but by default it should be unset for local development.
- packages/api/logs contain the log files that written to by the logger. This should be deleted occasionally, otherwise it will become unnecessarily large.

---

## Webstorm IDE Development Configurations ⛈️

- Open the TypeScript tool window (View | Tool Windows | TypeScript) and switch to the Errors tab.
  The tab lists the discrepancies in the code detected by the TypeScript Language Service. The list is updated dynamically as you change your code for easier and faster debugging.

- You can also monitor compilation errors by going to the TypeScript tool window (View | Tool Windows | TypeScript),
  and switching to the Compile errors tab which shows up only after first manual compilation, when you click the :hammer: button and select the compilation scope.

#### Cleaning up Local

- packages/api/logs contain the log files that written to by the logger. This should be deleted occasionally, otherwise it will
  become infinitely large.

- Delete estimate.cache.json to pull new data when testing to get most up to date data and verify querying is working
  as expected

---

## VSCode IDE Development Configurations 🖥️

- To run test on IDE, install the extension, `Jest Runner`, from marketplace

---

## Troubleshoot ⚠️

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

#### Failing integration tests.

- If you have another process running on localhost:3000 when the integration tests run, they will fail.
  This can happen when you are already running the client package, or the microsite.
  Please stop this process before re-running the integration tests.

---

### Tech Stack and Development Tools

![tech-stack](/Tech-Stack.png)

---

© 2021 Thoughtworks, Inc.
