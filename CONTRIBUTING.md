# contributing to cloud-carbon-footprint

## CI Pipeline

We use CircleCI for our pipeline. [Link to pipeline](https://app.circleci.com/pipelines/github/dtoakley-tw/cloud-carbon-footprint).

## To commit and push

To push to `trunk`:

1. Make your changes on the `trunk` branch.
1. Stage your changes: `git add [your changed files]`.
1. Commit your changes with this message format: `git commit -m "Your commit message | Your name, Pair's name`.
1. The pre-commit hook should run the linter, formatter, and tests for your _changed_ files. The hook will commit the changes when the pre-commit check passes.
1. Rebase `trunk`: `git pull --rebase`
1. Lint and test the entire codebase from the root directory: `npm run lint && npm test`.
1. Run the app from the root directory to ensure it starts: `npm start`.
1. Push to remote: `git push origin HEAD:trunk`.

Check the [CI pipeline builds](https://app.circleci.com/pipelines/github/dtoakley-tw/cloud-carbon-footprint)

- If the build <span style="color:green">passes</span>, you're done!
- If the build <span style="color:red">fails</span>, click the link highlighted below to read the errors, fix the issue, and commit/push the fix by following the instructions above

### To run all tests

- Run `npm test` from the root directory.

### Package management

- We use NPM for package management.
- To install a new package, use `npm install --save package-name` inside either the client or server directory.
- Use `npm run bootstrap` at the root directory to have all packages installed. Alternatively, run `npm ci` in the client and server directory.

### Module Aliasing

We've set up module aliasing within the src folder, so modules within the subfolders can be accessed with the @ prefix, e.g. @application/Module/. We implemented this by configuring tsconfig.json, jest.config.js and installing the `tsconfig-paths` package.

## Lightweight ADR's (Architectural Decision Records)

We record any significant architectural choices we make with lightweight adr files, located in the .adr folder. There is a template included as well. For more information about Lightweight ADR's, see [ThoughtWork's Technology Radar](https://www.thoughtworks.com/radar/techniques/lightweight-architecture-decision-records).
