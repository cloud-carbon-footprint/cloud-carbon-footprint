# contributing to cloud-carbon-footprint

### To commit and push
* First, push to the `trunk` branch:
  1. Make your changes on the `trunk` branch
  2. Lint your code by running `npm run lint:fix` and continue only if they pass
  3. Run all tests with `npm run test` and continue only if they pass
  4. `git add [your changed files]`
  5. `git commit -m "Your commit message | Your name, Pair's name`
  6. `git pull --rebase`
  7. Run all tests with `npm run test` and continue only if they pass
  8. `git push`

Check the [CI pipeline builds](https://travis-ci.com/dtoakley/cloud-carbon-footprint)
* If the build <span style="color:green">passes</span>, you're done!
* If the build <span style="color:red">fails</span>, click the link highlighted below to read the errors, fix the issue, and commit/push the fix by following the instructions above

### To run tests
* npm run test

### Package management
* Packages are managed using npm
* To install a new package, use `npm install package-name`
* To make sure all pagages are installed locally, run `npm install`

### Our CI pipeline and environments
We use TravisCI for our pipeline.