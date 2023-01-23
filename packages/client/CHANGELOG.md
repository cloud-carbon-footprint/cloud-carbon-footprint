# @cloud-carbon-footprint/client

## 4.0.0

### Major Changes

- 382814e2: Migrates to React 18

  For updates to your create-app templates, please see the following [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/531c35c878ac947020ad154accd06cfa820ec009).

### Minor Changes

- 81aac6a8: client error page and console now shows exact error message and detail

### Patch Changes

- 7afae983: Refactors useKilograms to an enum for Co2e unit (for easier extensibility of units)

  For updates to your create-app template, please review this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/55cc6dcd3de97a245265634c8b2c1806ff934907).

- fd4ec19b: Adds new AWS regions and emissions factors for ap-southeast-3 and me-central-1

## 3.3.0

### Minor Changes

- a6423a68: Set default value 'day' for GROUP_BY config parameter
- e9e57da7: Introduces new cache management logic for performance and scalability of larger data, including option for MongoDB NoSQL database as a cache

### Patch Changes

- Updated dependencies [a6423a68]
- Updated dependencies [a6423a68]
- Updated dependencies [a6423a68]
  - @cloud-carbon-footprint/common@1.8.0

## 3.2.0

### Minor Changes

- a7a79c83: updates client for new config, app for updated cache logic, and cli for seeding cache file

  client template changes located [here](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/5245b4b752ab4d381af58dc2db7cb57fbca9250a)
  clie template changes located [here](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/3568e74165e73343bfd579c544f6f3de7f3cdcec)

### Patch Changes

- a7a79c83: Updates carbon intensity maps to reflect new emissions factors

  For changes that are needed for the create-app client template, please review this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/265d49fba159612eb6cdbb09a9d2e5fd7989e67e).

- Updated dependencies [a7a79c83]
  - @cloud-carbon-footprint/common@1.7.0

## 3.1.2

### Patch Changes

- 1c28bfc3: updates client to fix console errors and use update mui

  Please refer to [this commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/37be2b6c48cbc517fa825e22346091e5a5ae6f69) for create-app template changes

## 3.1.1

### Patch Changes

- f6bef017: updates build in ci workflow

## 3.1.0

### Minor Changes

- 329f0e7c: updates themes to fix backstage plugin
  please refer to [this commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/827c2c7f081799704b4733f12757f9d02b4c2440) for template updates

## 3.0.0

### Major Changes

- ebe78a83: Updates CCF Client to allow for publishable component libraries (Backstage Plugin Compatibility)

  **Breaking Changes**: This update contains important refactors to the client package which includes updating the build script to build the new component library, changes to the service hooks, as well as adding better error handling for api calls.

  For update to the create-app templates, please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/7a6457bd9de48ffdfccca4232a1f8b744efd9be1) (includes necessary major client changes).

### Patch Changes

- 510d4b86: updates packages: axios googleapis dotenv @types/jest-when

  See [this commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/8d8c1db6ff94da5127d559e10632479a8520c67a) for changes to the create-app templates.

- 96b710fb: Adds REACT_APP_GROUP_BY to client env template so it's more discoverable
- ff05607b: Bumps to latest version of typescript and sets resolution for this

  See [this commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/6cdc1469dcd5380c9c8a84b9fe13b977991db54c) for changes to the create-app templates.

- Updated dependencies [510d4b86]
- Updated dependencies [ff05607b]
  - @cloud-carbon-footprint/common@1.5.1

## 2.3.4

### Patch Changes

- b5222054: Updates create-app yarn version to 3, fixed type error in create-app and adds resolution for @babel/core due to compilation error in create-app

  Please see [this commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/1474abca91e4e7118a1f4a25df2921ca1bf502f6) for create-app template updates.

## 2.3.3

### Patch Changes

- e562970f: Replaces typography.fontWeightBold with 'bold' string to fix compilation errors in create-app package

  See [this commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/aed91d0ec33a78bb64f1a93f93cdb2c578fc5e8a) for updating your create-app templates.

## 2.3.2

### Patch Changes

- f40ce29e: Adds Compute Optimizer Recommendations for AWS
- 0e577b5b: Bumps react-router-dom to latest major version, and updates related code
- Updated dependencies [f40ce29e]
- Updated dependencies [04f2be16]
  - @cloud-carbon-footprint/common@1.4.0

## 2.3.1

### Patch Changes

- 8fd171ed: Updates a number of packages and fixes linting, typescript and dependency issues
- e72d9807: Fixes recommendations forecast projected totals showing negative numbers when current totals are too low

  For updates to create app templates, please review the following commits:

  - [Initial Commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/73d505f79f8f4eccc0808d714a8b6c74020ee87e)
  - [Second Commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/7d60888a7b716427ffc7a934ca137d8a86b373f8)
  - [Final Commit]()https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/d62bfc5837a96510882c75bca71249ddf6152b9a

- Updated dependencies [8fd171ed]
  - @cloud-carbon-footprint/common@1.3.1

## 2.3.0

### Minor Changes

- c29a3b53: Adds support for specifying groupBy via API param and for displaying line chart data according to data grouping

  For changes to create-app templates, please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/8743e9a36f005716095300b7a1f331b4ffaa8100).

### Patch Changes

- c29a3b53: updates testing and groupby param default
  Commit for the groupBy param default change can be found [here](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/a6630892a294213b798cb529ffe8f3504f7a7dad)
- Updated dependencies [c29a3b53]
  - @cloud-carbon-footprint/common@1.3.0

## 2.2.1

### Patch Changes

- a304acb6: Upgrades version of typescript to 4.5.3
- a304acb6: updates GCPAccount to use MIN_WATTS_MEDIAN and MAX_WATTS_MEDIAN to compute estimations actually work. Updates client to not break when cost is zero

  please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/0cdcd2c5ab0b68a69374b31b32c10721fb8f094a) for create-app package updates.

- Updated dependencies [a304acb6]
  - @cloud-carbon-footprint/common@1.2.1

## 2.2.0

### Minor Changes

- 4238d3b8: Adds custom pagination to the top and bottom of the recommendations table

  For changes to the create-app templates, please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/6137391c474861bfa61c68c15371fc1167c39f4e)

- 4238d3b8: Allow recommendations side panel to be opened and closed by clicking the same recommendation row. Also fixed bug where side panel would not reopen for same recommendation row after being closed
- 4238d3b8: Adds mobile incompatibility warning for devices smaller than intended screen size

  For changes to Create-App templates, please reference this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/42769e1ba6f273807bc9053adc98dae2df967a09).

### Patch Changes

- 4238d3b8: Update messaging on recs table when no data due to filtering

  For changes to Create-App templates, please reference this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/d4b2d6fb4dfd5a99d4601e8bbbf52d22fef83a73).

- 4238d3b8: Cache produces different data depending on which page is loaded

  For changes to the create-app templates, please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/70ae49e00e3d0bb3fd5c9e439a6a309bc9f04381)

- 4238d3b8: Metric tons / kg toggle applies to full recs dashboard

  For changes to Create-App templates, please reference this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/3eaa11435c57c18657c19f2e276ec1e709d1f58e).

- 4238d3b8: Updates packages axios, googleapis and @changesets/cli
- 4238d3b8: Fixes filters bug not being able to apply more than 1 filter on recs page

  For changes to the Create-App templates, please reference this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/a21d9a96a86442f06d3e0468fd8b86b992884b30)

- 4238d3b8: Searching in recs table does not work for kg
  For changes to Create-App templates, please reference this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/90565c8598f18f75db274485e6aed2e768b391e0).
- 4238d3b8: Filter dropdown for Recommendations should not side scroll

  For changes to Create-App templates, please reference this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/f782f760ff752cc994caa972360eddd95533be09).

- 4238d3b8: Stop rounding to 0 in rec table and enable search for co2 savings in kg
- 4238d3b8: adds embodied emissions documentation to client side panel
  Please reference [this commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/6a1984c8930e799477ff73054b2c879b9f16fbe2) for updates.

## 2.1.1

### Patch Changes

- 639c03d0: Changes timeframe for data in Recommendations Forecast to only be monthly

  Please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/0a818fbad4449af2082f7cd388682bb782e2a813) for updates to the create-app templates.

- e01b216a: Improves window size responsiveness for recommendations forecast

  For updating Create-App templates, please refer to the following [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/c9716cbaf91b577e8a0a7baee0bac12561f2e4b2).

- 6b03f382: Bumps json-server depenedency

## 2.1.0

### Minor Changes

- 8a380bd3: Adds to the recommendations page and implements filtering and sorting
  To update create-app templates, refer to [this link](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/1640acda32e22a9777ff5360a278d2dfc6971889)

## 2.0.0

### Major Changes

- 52237bc6: Adds additional dashboard for viewing cloud provider recommendations including refactoring filters for reusability

  For updating the create-app templates, please refer to the following [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/d1f9a94ea88e6f9210a781e16df18b9f64a0b03d).

### Patch Changes

- f3569daa: Updates emissions factor api response to include cloud provider

  For create-app template updates, please refer to [this commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/c19cca55d4c095d81f0bb80745580741d73405b5)

- c973b85f: Fixes rendering of client when very small numbers return for co2e/energy/cost
- Updated dependencies [f3569daa]
- Updated dependencies [61332214]
- Updated dependencies [52237bc6]
  - @cloud-carbon-footprint/common@1.2.0

## 1.0.1

### Patch Changes

- 62491735: [365] remove gcp accounts in aws from mock data
- 5407c95b: Bumps concurrently and googleapis packages to latest versions
- Updated dependencies [f75cf08f]
- Updated dependencies [52a8b3c1]
  - @cloud-carbon-footprint/common@1.1.0

## 1.0.0

### Major Changes

- c7ce1dbd: Refactors the client package to use presentation/container style and updates the create-app templates

  Please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/5c1e9b6c68d270c0005f63ac77d8c258bf23db4b) to update the create-app templates.

### Minor Changes

- e76d5fdd: Adds accountId to the Estimation Results returned from the Cloud Carbon Footprint API

  Please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/cd2d5b988544246d87abbc441895d76003fed72b) to update create app templates.

### Patch Changes

- bbceed8b: Updates dependencies: @types/fs-extra, typescript, husky and @types/node
- 40869725: Removes cloud provider from Unknown accounts from frontend

  Please refer to these commits for create-app template updates:
  [1](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/dfb467a5aac500f91b170f1c1af1f452ceb01ca4)
  [2](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/0e573e7d2921bc353fa1f9de11d53b13b4f6c91a)

- Updated dependencies [13f39ac7]
- Updated dependencies [91ed3d75]
- Updated dependencies [72fc2752]
- Updated dependencies [e76d5fdd]
- Updated dependencies [bbceed8b]
  - @cloud-carbon-footprint/common@1.0.0

## 0.10.0

### Minor Changes

- d40ed56e: refactor client package to use component based directories

  To update create-app template files, refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/88639844c7fd3fb6ea65afd9a878e25da9290350).

### Patch Changes

- 3b42775b: Updates @types/node to 15.12.4
- Updated dependencies [e93d31ec]
- Updated dependencies [3b42775b]
- Updated dependencies [53366130]
  - @cloud-carbon-footprint/common@0.0.3

## 0.9.0

### Minor Changes

- da0074d9: Adds Carbon Intensity Map for each cloud provider to the dashboard

  There are many files that have been added to the client package.
  In order to update the create-app templates, refer to the follow commits:

  - [a4bd92c](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/174c7b0229bf8d9b7ec37cb562ff2eac5ef45759)
  - [174c7b0](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/994cd3e4ebe86ba575c232e5092141a82b588e1b)

  The following change was made to the `packages/create-app/templates/default-app/packages/client/dashboard/CloudCarbonContainer` file:

  ```diff
      import { FilterResultResponse } from '../models/types'
      import NoDataPage from './NoDataPage'
      import config from '../ConfigLoader'
  +   import { CarbonIntensityMap } from './CarbonIntensityMap/CarbonIntensityMap'

      const PADDING_FILTER = 0.5
      const PADDING_LOADING = 2

      // …

                          </Grid>
                        </Grid>
                      </Grid>
  +                    <Grid item xs={12}>
  +                      <CarbonIntensityMap />
  +                    </Grid>
                    </Grid>
                  </Grid>
                  </div>

      // …

  ```

### Patch Changes

- bf59e600: fixes eslint and tsconfig

  For updating create-app templates, refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/9e553fc41e06cfbdf0d231731bbef68eb2e0d15e).

- Updated dependencies [8e24c32b]
  - @cloud-carbon-footprint/common@0.0.2

## 0.8.0

### Minor Changes

- d24c1274: Change Carbon equivalency component to be globally relevant

  `packages/client/src/dashboard/CarbonComparisonCard.tsx`:

  ```diff
      // ...

          }
      })

  -    export const toMiles = (co2mt: number): number => co2mt * 2481.3918390475
  -    export const toGas = (co2mt: number): number => co2mt * 112.5247230304
  +    export const toFlights = (co2mt: number): number => co2mt * 1.2345679 // direct one way flight from NYC to London per metric ton per CO2
  +    export const toPhones = (co2mt: number): number => co2mt * 121643 // phones charged per metric ton of CO2
      export const toTrees = (co2mt: number): number => co2mt * 16.5337915448

      export const CarbonComparisonCard: FunctionComponent<CarbonComparisonCardProps> =

      // ...

          const [selection, setSelection] = useState('flights')
          const mtSum: number = sumCO2(data)

  -        const milesSum = toMiles(mtSum)
  -        const gasSum = toGas(mtSum)
  +        const totalFlights = toFlights(mtSum)
  +        const totalPhones = toPhones(mtSum)
          const treesSum = toTrees(mtSum)

  -        const formatNumber = (number: number, decimalPlaces = 0) =>
  -        number.toLocaleString(undefined, { maximumFractionDigits: decimalPlaces })
  +        const formatNumber = (number: number, decimalPlaces = 0) => {
  +        if (number >= 1000000000) return `${(number / 1000000000).toFixed(1)}+ B`
  +
  +        if (number >= 1000000) return `${(number / 1000000).toFixed(1)}+ M`
  +
  +        return number.toLocaleString(undefined, {
  +            maximumFractionDigits: decimalPlaces,
  +           })
  +        }

          const comparisons: Comparison = {
          flights: {
              icon: (
                  <FlightTakeoff className={classes.icon} data-testid="flightsIcon" />
              ),
  -            total: milesSum,
  -            textOne: 'greenhouse gas emissions from',
  -            textTwo: 'miles driven on average',
  +            total: totalFlights,
  +            textOne: 'CO2e emissions from',
  +            textTwo: 'direct one way flights from NYC to London',
          },
          phones: {
              icon: (
                  <PhonelinkRing className={classes.icon} data-testid="phonesIcon" />
              ),
  -            total: gasSum,
  +            total: totalPhones,
  -            textOne: 'CO2 emissions from',
  +            textOne: 'CO2e emissions from',
  -            textTwo: 'gallons of gasoline consumed',
  +            textTwo: 'smartphones charged',
          },
          trees: {
              icon: <Eco className={classes.icon} data-testid="treesIcon" />,

      // ...
  ```

- ababb826: Extracts two new packages app and common to avoid circular dependancies and make it easier to extract cloud provider packages
- e84a4c7a: Extract logic into the new packages: app, common, gcp, aws, azure:

  There are many files that have been updated/extracted.
  In order to update create-app templates, refer to the follow [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/8c6aaed52e9f3949e134852986d50362aad3367a).

  The following changes were made to,
  'packages/create-app/templates/default-app/packages/client/tsconfig.json':

  ```diff
      // ...
          "skipLibCheck": true,
          "esModuleInterop": true,
          "allowSyntheticDefaultImports": true,
  -        "strict": true,
          "forceConsistentCasingInFileNames": true,
          "module": "esnext",
          "moduleResolution": "node",
          "resolveJsonModule": true,
  -        "isolatedModules": true,
          "noEmit": true,
          "jsx": "react-jsx",
  -        "noFallthroughCasesInSwitch": true
  +        "noFallthroughCasesInSwitch": true,
  +        "strict": false,
  +        "isolatedModules": true
        },
  -      "include": [
  -        "src",
  -        "node_modules/apexcharts/types/apexcharts.d.ts"
  -      ]
  +      "include": ["src"]
      }
      // ...
  ```

  Additionally, the following dependencies have been updated and should also be updated in their respective template package.json file:

  - @cloud-carbon-footprint root package.json:
    - "@types/fs-extra": "^9.0.11"
    - "concurrently": "^6.2.0"
    - "marked": ">=2.0.5"
  - @cloud-carbon-footprint/api and @cloud-carbon-footprint/cli:
    - "dotenv": "^10.0.0"
    - "@cloud-carbon-footprint/app": Can be added with `yarn up @cloud-carbon-footprint/app`
    - "@cloud-carbon-footprint/common": Can be added with `yarn up @cloud-carbon-footprint/common`
  - @cloud-carbon-footprint/client:
    - "dotenv": "^10.0.0"
    - "@testing-library/react-hooks": "^7.0.0"
    - "concurrently": "^6.2.0"
    - "@cloud-carbon-footprint/common": Can be added with `yarn up @cloud-carbon-footprint/common`

### Patch Changes

- c7fa7db0: Updates dependencies to the latest
- e1353b87: Refactor CarbonComparisonCard to be more resuable with configuring comparison types
- c5889453: Updates CarbonFormulaDrawer to link to the microsite

  `packages/client/src/dashboard/CarbonFormulaDrawer.tsx`:

  ```diff
      // ...

          available.
          </Typography>
          <Link
  -          href="https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/microsite/docs/Methodology.md"
  +          href="https://www.cloudcarbonfootprint.org/docs/methodology"
            target="_blank"
            rel="noopener"
            className={classes.methodology}

      // ...
  ```

## 0.7.0

### Minor Changes

- 6917116b: Updates the formula in the sidebar with new sources for emissions factor:

  `packages/client/src/dashboard/CarbonFormulaDrawer.tsx`:

  ```diff
      // ...

      whiteSpace: 'pre-line',
      fontSize: typography.body2.fontSize,
      },
  + formula: {
  +   fontFamily: 'monospace',
  + },
      methodology: {
      padding: spacing(2),
      display: 'flex',

      // ...

      <Typography className={classes.content} component="p">
      Our CO2e Estimate Formula:
      </Typography>
  - <Typography className={classes.content} component="p">
  -   (Cloud provider service usage) x (Cloud provider Power Usage
  -   Effectiveness [PUE]) x (Cloud energy conversion factors [kWh]) x (EPA
  -   [US] or carbonfootprint.com [Non-US] grid emissions factors [CO2e])
  + <Typography
  +   className={clsx(classes.content, classes.formula)}
  +   component="p"
  + >
  +   (Cloud provider service usage) x (Cloud energy conversion factors
  +   [kWh]) x (Cloud provider Power Usage Effectiveness (PUE)) x (grid
  +   emissions factors [metric tons CO2e])
      </Typography>
      <Divider />
      <Typography className={classes.content} component="p">

      // ...
  ```

- f48a0f56: Updates the filter options to be a fixed header:

  `packages/client/src/dashboard/charts/ApexBarChart.tsx`:

  ```diff
      // ...

      import React, { ReactElement } from 'react'
      import { Container } from '@material-ui/core'
  + import { makeStyles } from '@material-ui/core/styles'
      import { Switch, Route } from 'react-router-dom'
      import ErrorPage from './dashboard/ErrorPage'
      import CloudCarbonContainer from './dashboard/CloudCarbonContainer'
      import { CarbonFormulaDrawer } from './dashboard/CarbonFormulaDrawer'
      import HeaderBar from './dashboard/HeaderBar'

      function App(): ReactElement {
  +   const useStyles = makeStyles(() => ({
  +     appContainer: {
  +       padding: 0,
  +     },
  +   }))
  +
  +   const classes = useStyles()
  +
      return (
          <>
          <HeaderBar />

  -       <Container maxWidth={'xl'}>
  +       <Container maxWidth={'xl'} className={classes.appContainer}>
              <Switch>
              <Route path="/error" exact>
                  <ErrorPage />

      // ...
  ```

  `packages/client/src/dashboard/CloudCarbonContainer.tsx`:

  ```diff
      // ...

      const useStyles = makeStyles((theme) => ({
      boxContainer: {
      padding: theme.spacing(3, 10),
  +   marginTop: 62,
  + },
  + filterHeader: {
  +   top: 0,
  +   left: 'auto',
  +   position: 'fixed',
  +   marginTop: '64px',
  +   width: '100%',
  +   backgroundColor: '#fff',
  +   borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
  +   zIndex: 1199,
  +   padding: '9px 10px 7px 10px',
      },
      filterContainer: {
      display: 'flex',
      flexWrap: 'wrap',
  -   paddingBottom: theme.spacing(1),
  +   justifyContent: 'center',
      },
      filter: {
      resize: 'none',
  -   padding: theme.spacing(PADDING_FILTER),
  -   paddingLeft: 0,
  +   padding: '2px 4px 0 4px',
      marginRight: theme.spacing(PADDING_FILTER),
      minWidth: '240px',
      },

      // ...

      </div>
      </Grid>
      ) : (
  -   <div className={classes.boxContainer}>
  -     <Grid container>
  +   <>
  +     <div className={classes.filterHeader}>
          <Grid item xs={12}>
              <div className={classes.filterContainer}>

      // ...

                  </div>
                  </div>
              </Grid>
  -         <Grid container spacing={3}>
  -           <Grid item xs={12}>
  -             <Card style={{ width: '100%', height: '100%' }}>
  -               <Box padding={3} paddingRight={4}>
  -                 {filteredData.length ? (
  -                   <ApexLineChart data={filteredData} />
  -                 ) : (
  -                   <div className={classes.noData}>
  -                     <p>Cloud Usage</p>
  -                     <NoDataPage isTop={true} />
  -                   </div>
  -                 )}
  -               </Box>
  -             </Card>
  -           </Grid>
  -           <Grid item xs={12}>
  -             <Grid
  -               container
  -               spacing={3}
  -               style={{
  -                 display: 'flex',
  -                 flexDirection: 'row',
  -                 flexWrap: 'wrap-reverse',
  -               }}
  -             >
  -               <Grid item className={classes.gridItemCards}>
  -                 <CarbonComparisonCard data={filteredData} />
  -               </Grid>
  -               <Grid item className={classes.gridItemCards}>
  -                 <EmissionsBreakdownContainer data={filteredData} />
  +       </div>
  +       <div className={classes.boxContainer}>
  +         <Grid container>
  +           <Grid container spacing={3}>
  +             <Grid item xs={12}>
  +               <Card style={{ width: '100%', height: '100%' }}>
  +                 <Box padding={3} paddingRight={4}>
  +                   {filteredData.length ? (
  +                     <ApexLineChart data={filteredData} />
  +                   ) : (
  +                     <div className={classes.noData}>
  +                       <p>Cloud Usage</p>
  +                       <NoDataPage isTop={true} />
  +                     </div>
  +                   )}
  +                 </Box>
  +               </Card>
  +             </Grid>
  +             <Grid item xs={12}>
  +               <Grid
  +                 container
  +                 spacing={3}
  +                 style={{
  +                   display: 'flex',
  +                   flexDirection: 'row',
  +                   flexWrap: 'wrap-reverse',
  +                 }}
  +               >
  +                 <Grid item className={classes.gridItemCards}>
  +                   <CarbonComparisonCard data={filteredData} />
  +                 </Grid>
  +                 <Grid item className={classes.gridItemCards}>
  +                   <EmissionsBreakdownContainer data={filteredData} />
  +                 </Grid>
                  </Grid>
                  </Grid>
              </Grid>
              </Grid>
  -       </Grid>
  -     </div>
  +       </div>
  +     </>
      )
      }
  ```

- c89184bb: Indicates Cloud Provider on the Emissions Breakdown Bar Chart:

  `packages/client/src/dashboard/charts/ApexBarChart.tsx`:

  ```diff
      // ...

      export interface Entry {
  -   x: string
  +   x: string[]
      y: number
      }

      // ...

  - const dataEntries: { x: string; y: number }[] = Object.entries(barChartData)
  -   .filter((item) => item[1] > 0)
      .map((item) => ({
  -     x: item[0],
  -     y: item[1],
  -   }))
  -   .sort((higherC02, lowerCO2) => lowerCO2.y - higherC02.y)

  + const dataEntries: { x: string[]; y: number }[] = Object.entries(barChartData)
  +   .filter((item) => item[1][1] > 0)
      .map((item) => ({
  +     x: [item[0], `(${item[1][0]})`],
  +     y: item[1][1],
      }))
      .sort((higherC02, lowerCO2) => lowerCO2.y - higherC02.y)

      // ...

      ): string[] => {
      const regionColorsMap: string[] = []
      pageData.data.forEach((region) => {
  -     const currentRegion = region.x
  +     const currentRegion = region.x[0]
          let color = chartBarCustomColors[0]
      // ...
  ```

  `packages/client/src/dashboard/charts/ApexDonutChart.tsx`:

  ```diff
      // ...

      }[] = Object.entries(donutData)
      .map((item) => ({
          serviceOrRegion: item[0],
  -     c02Value: item[1],
  +     c02Value: item[1][1],
      }))

      // ...
  ```

  `packages/client/src/dashboard/transformData.tsx`:

  ```diff
      // ...

      const sumCO2ByServiceOrRegion = (
      data: EstimationResult[],
      dataType: string,
  - ): { string: number } => {
  + ): { string: [string, number] } => {
      const serviceEstimates = data.flatMap(
          (estimationResult) => estimationResult.serviceEstimates,
      )

  -   return serviceEstimates.reduce((acc, initialValue, index, arr) => {
  +   return serviceEstimates.reduce((acc, _initialValue, index, arr) => {
          const value = arr[index]

          checkUnknownTypes(dataType, value)

          const property = getPropertyFromDataType(dataType, value)

          if (acc.hasOwnProperty(property)) {
  -       acc[property] += value.co2e // { ec2: 18 }
  +       acc[property] = [value.cloudProvider, acc[property][1] + value.co2e] // { ec2: 18 }
          } else {
  -       acc[property] = value.co2e
  +       acc[property] = [value.cloudProvider, value.co2e]
          }

          return acc
      }, Object.create({}))
      }

      // ...
  ```

### Patch Changes

- f48a0f56: Fixes issue with labels for emission breakdown chart being cut off:

  `packages/client/src/dashboard/charts/ApexBarChart.tsx`:

  ```diff
      // ...

          xaxis: {
          type: 'category',
          labels: {
  -        show: false,
  +        style: {
  +           fontSize: 0,
  +         },
          },
          axisBorder: {
              show: false,
          },
          max: maxThreshold,
          },
          yaxis: {
          labels: {
              style: {
              fontSize: '13px',
              },
          },
          },
          tooltip: {
          fillSeriesColor: false,
  -       x: {
  -         show: false,
  -       },
          y: {
              formatter: function (value: number, opts: { dataPointIndex: number }) {
              return `${dataEntries[

      // ...
  ```

- 56bb6da6: #244 Bug fixed by changing configs boolean conditionals:
  In order to update, you need to apply the following changes in the `client` package:

  `packages/client/src/dashboard/CarbonFormulaDrawer.tsx`:

  ```diff
      // ...

        }
      }

  -    const previousYearOfUsage = !!process.env.REACT_APP_PREVIOUS_YEAR_OF_USAGE
  +    const previousYearOfUsage =
  +        !!process.env.REACT_APP_PREVIOUS_YEAR_OF_USAGE &&
  +        process.env.REACT_APP_PREVIOUS_YEAR_OF_USAGE !== 'false'

      const appConfig: ClientConfig = {
          CURRENT_PROVIDERS: [

      // ...
  ```

- b63d8a67: The default `aws-sdk` dependency was bumped to `"^2.890.0"`,
- 8b81e904: removes end date env variable:

  `packages/client/src/Config.ts`:

  ```diff
      // ...
          VALUE: string
          TYPE: string
      }
  -   END_DATE: string | null
      }

      const previousYearOfUsage = !!process.env.REACT_APP_PREVIOUS_YEAR_OF_USAGE

      // ...

          VALUE: process.env.REACT_APP_DATE_RANGE_VALUE || '12',
          TYPE: process.env.REACT_APP_DATE_RANGE_TYPE || 'months',
      },
  -   END_DATE: process.env.REACT_APP_END_DATE || null,
      }

      export default appConfig
  ```

      `packages/client/src/dashboard/CloudCarbonContainer.tsx`:

  ```diff
      // ...

      const dateRangeType: string = config().DATE_RANGE.TYPE
      const dateRangeValue: string = config().DATE_RANGE.VALUE
  - let endDate: moment.Moment
  + const endDate: moment.Moment = moment.utc()
      let startDate: moment.Moment
  - if (config().END_DATE) {
  -   endDate = moment.utc(config().END_DATE)
  - } else {
  -   endDate = moment.utc()
  - }
      if (config().PREVIOUS_YEAR_OF_USAGE) {
      startDate = moment.utc(Date.UTC(endDate.year() - 1, 0, 1, 0, 0, 0, 0))
      } else {
  -   startDate = config().END_DATE ? moment.utc(config().END_DATE) : moment.utc()
  -   startDate.subtract(
  -     dateRangeValue,
  -     dateRangeType as unitOfTime.DurationConstructor,
  -   )
  +   startDate = moment
  +     .utc()
  +     .subtract(dateRangeValue, dateRangeType as unitOfTime.DurationConstructor)
      }

      // ...
  ```

- f48a0f56: Fixes shifting of the bars on the Emissions Breakdown BarChart:

  `packages/client/src/dashboard/charts/ApexBarChart.tsx`:

  ```diff
      // ...

      xaxis: {
          type: 'category',
          labels: {
  -       style: {
  -         fontSize: 0,
  -       },
  +       show: false,
          },
          axisBorder: {
          show: false,
          },
          max: maxThreshold,
      },
      yaxis: {
          labels: {
          style: {
              fontSize: '13px',
          },
  +       align: 'left',
  +       formatter: function (value: string) {
  +         if (typeof value === 'string' && value.length > 15) {
  +           return value.substring(0, 15) + '...'
  +         }
  +         return value
  +       },
          },
      },
      tooltip: {

      // ...
  ```

- 3e759462: Fixes spacing and alignment issues for right-sided axes for the Cloud Usage graph:

  `packages/client/src/Config.ts`:

  ```diff
      // ...

              fontSize: '15px',
          },
          },
  -     forceNiceScale: true,
  +     tickAmount: 10,
          decimalsInFloat: 3,
      },
      {
          max: 1.1 * maxKilowattHours,
          title: {
  -       text: 'kilowatt hours (kWh)',
  +       text: 'Kilowatt Hours (kWh)',
          opposite: -8,
          style: {
              fontSize: '15px',
              color: yellow,
          },
          },
  +     tickAmount: 10,
          decimalsInFloat: 2,
          opposite: true,
          axisBorder: {
          show: true,
          color: yellow,
          },
          axisTicks: {
  -       show: true,
  -       offsetX: -30,
  +       show: false,
          },
  -     forceNiceScale: true,
          showAlways: false,
      },
      {
          max: 1.1 * maxCost,

      // ...

              color: green,
          },
          },
  +     tickAmount: 10,
          decimalsInFloat: 2,
          opposite: true,
          axisBorder: {
          show: true,
          color: green,
          offsetX: -5,
          },
          axisTicks: {
  -       show: true,
  -       offsetX: -30,
  +       show: false,
          },
  -     forceNiceScale: true,
          showAlways: false,
      },
      ],

      // ...
  ```

## 0.6.0

### Minor Changes

- ce391719: Updates the filter options to be a fixed header

### Patch Changes

- 86a11f4e: Fixes issue with labels for emission breakdown chart being cut off
- 67867f37: Fixes shifting of the bars on the Emissions Breakdown BarChart

## 0.5.2

### Patch Changes

- 81dfde6c: Improves .env.template files with links to cofiguration glossary

## 0.5.1

### Patch Changes

- 6d43b26f: fixes type issue with apex charts
- 58064ebd: fixes unknown region display name
- c0cc067a: adds initial create app package

## 0.5.0

### Minor Changes

- 66676453: Fix: react hook error when loading data

### Patch Changes

- 8175b41d: updates packages with readmes and metadata

## 0.4.0

### Minor Changes

- 033a504: adds integration testing
- f33b9eb: adds color to regior bar chart based on carbon intensity

### Patch Changes

- c2b24e7: fix tests to use mock remote hooks
- 063ae7d: updates jest, immer and testing library dependencies

## 0.3.0

### Minor Changes

- 75176d7: Updates the cloud provider queries to be configurable by grouping dates and allows configurable date ranges

### Patch Changes

- 1977dd4: Adds null check AccountChooser
- e2ac070: Fixes default config for querying data

## 0.2.0

### Minor Changes

- 96cb023: Adds support for Microsoft Azure, as well as updates to the microsite.

## 0.1.0

### Minor Changes

- 3b3bec3: Update packages to have base version
