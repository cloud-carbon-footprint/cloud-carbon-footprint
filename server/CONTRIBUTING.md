# contributing to cloud-carbon-footprint

### To commit and push
* First, push to the `trunk` branch:
  1. Make your changes on the `trunk` branch
  2. Lint your code by running `./scripts/lint.bash` from the top level directory and continue only if they pass
  3. Run all tests from the top level directory with `./scripts/test.bash` and continue only if they pass
  4. `git add [your changed files]`
  5. `git commit -m "Your commit message | Your name, Pair's name`
  6. `git pull --rebase`
  7. Run all tests from the top level directory with `./scripts/test.bash` and continue only if they pass
  8. Run the app from the top level directory with `./scripts.cli.bash` 
  9. `git push`

Check the [CI pipeline builds](https://travis-ci.com/dtoakley/cloud-carbon-footprint)
* If the build <span style="color:green">passes</span>, you're done!
* If the build <span style="color:red">fails</span>, click the link highlighted below to read the errors, fix the issue, and commit/push the fix by following the instructions above

### To run tests
* Run all tests with `./scripts/test.bash` from the top level directory

### Package management
* Packages are managed using npm
* To install a new package, use `npm install package-name` inside either the client or server directory
* To make sure all pagages are installed locally, run `npm install` inside either the client or server directory

### Our CI pipeline and environments
We use TravisCI for our pipeline.

### Module Aliasing
We've set up module aliasing within the src folder, so modules within the subfolders can be accessed with the @ prefix, e.g. @application/Module/. We implemeneted this by configuring tsconfig.json, jest.config.js and installing the `tsconfig-paths` package.

## Lightweight ADR's (Architectural Decision Records)
We record any significant architecural choices we make with lightweight adr files, located in the .adr folder. There is a template included as well. For more information about Lightweight ADR's, see [ThoughtWork's Technology Radar](https://www.thoughtworks.com/radar/techniques/lightweight-architecture-decision-records)
