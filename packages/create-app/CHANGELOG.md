# @cloud-carbon-footprint/create-app

## 1.0.0

### Major Changes

- 52237bc6: Adds additional dashboard for viewing cloud provider recommendations including refactoring filters for reusability

  For updating the create-app templates, please refer to the following [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/d1f9a94ea88e6f9210a781e16df18b9f64a0b03d).

### Patch Changes

- c973b85f: Fixes rendering of client when very small numbers return for co2e/energy/cost
- 04cdf8f9: Downgrades ora packages to fix create-app build

## 0.5.1

### Patch Changes

- a9ae393: updates contributing.md with instructions to use create-app test script

## 0.5.0

### Minor Changes

- d7fd8fda: adds a script to test create app before publishing

### Patch Changes

- 62491735: [365] remove gcp accounts in aws from mock data
- 11f59f1f: updates client template to fix create-app

  To update your created-app, please refer to the changes in [this commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/d519971a538400fd9358eb98d1e60c5ef4c7de20)

- 52a8b3c1: Adds support for specifying recommendation target for AWS via API parameter

  Please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/404c77796ae838766dc8007e18daee2c7526f6ed) to update create app templates.

## 0.4.16

### Patch Changes

- 13f39ac7: implements recommendations for aws rightsizing recommendations api

  Please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/b2181a1942b0910613c8b15f97d074a7be6100b8) to update create app templates.

- 91ed3d75: Update variables GCP_BILLING_ACCOUNT_ID/GCP_BILLING_ACCOUNT_NAME to be GCP_BILLING_PROJECT_ID/GCP_BILLING_PROJECT_NAME

  This is a major update for packages: api, cli, common. Please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/aab00ea5a395d94ba5ce1424ffa33abbafd7ed58) for create-app template updates as they are breaking changes.

- bbceed8b: Updates dependencies: @types/fs-extra, typescript, husky and @types/node
- 40869725: Removes cloud provider from Unknown accounts from frontend

  Please refer to these commits for create-app template updates:
  [1](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/dfb467a5aac500f91b170f1c1af1f452ceb01ca4)
  [2](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/0e573e7d2921bc353fa1f9de11d53b13b4f6c91a)

- c7ce1dbd: Refactors the client package to use presentation/container style and updates the create-app templates

  Please refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/5c1e9b6c68d270c0005f63ac77d8c258bf23db4b) to update the create-app templates.

## 0.4.15

### Patch Changes

- d3899a0a: Removed files for yarn 2.4.2 to fix the yarn install for create-app template

## 0.4.14

### Patch Changes

- 16b8253d: Updates create-appp package to use yarn 2.4.2, and allows for implicit anys so CCF modules can be imported successfully

## 0.4.13

### Patch Changes

- d40ed56e: updates client packages template files

## 0.4.12

### Patch Changes

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

- 6ca71c60: fixes bugs with create app script and templates

  To update the create-app templates, refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/acd29286ea6cc930f156a7242227581aa3344f05).

- bf59e600: fixes eslint and tsconfig

  For updating create-app templates, refer to this [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/9e553fc41e06cfbdf0d231731bbef68eb2e0d15e).

## 0.4.4

### Minor Changes

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

- c7fa7db0: Updates dependencies to the latest
- 54c6e5fc: updates check for error type

  `packages/api/src/api.ts`:

  ```diff
      // ...

        } catch (e) {
          apiLogger.error(`Unable to process footprint request.`, e)
  -       if (e instanceof EstimationRequestValidationError) {
  +       if (
  +          e.constructor.name ===
  +          EstimationRequestValidationError.prototype.constructor.name
  +       ) {
            res.status(400).send(e.message)
  -       } else if (e instanceof EstimationRequestValidationError) {
  +       } else if (
  +          e.constructor.name === PartialDataError.prototype.constructor.name
  +       ) {
            res.status(416).send(e.message)
          } else res.status(500).send('Internal Server Error')

      // ...
  ```

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

## 0.3.4

### Patch Changes

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

- 68770ef4: updates create app templates and bumps the following deps: `"typescript": "4.2.4"`, `"ts-node": "^9.1.1"`, `"fs-extra": "^10.0.0"`, `"@types/fs-extra": "^9.0.10"`
- 1a7350ad: - b63d8a6: The default `aws-sdk` dependency was bumped to `"^2.890.0"`

  - 6917116: Updates the formula in the sidebar with new sources for emissions factor:
    In order to update, you need to apply the following changes in the `client` package:

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

  - c89184b: Indicates Cloud Provider on the Emissions Breakdown Bar Chart:
    In order to update, you need to apply the following changes in the `client` package:

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

  - ce39171: Updates the filter options to be a fixed header
    In order to update, you need to apply the following changes in the `client` package:

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

  - 8b81e90: removes end date env variable
    In order to update, you need to apply the following changes in the `client` package:

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

  - 3e75946: Fixes spacing and alignment issues for right-sided axes for the Cloud Usage graph
    In order to update, you need to apply the following changes in the `client` package:

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

  - 86a11f4: Fixes issue with labels for emission breakdown chart being cut off
    In order to update, you need to apply the following changes in the `client` package:

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

  - 67867f3: Fixes shifting of the bars on the Emissions Breakdown BarChart
    In order to update, you need to apply the following changes in the `client` package:

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

  - 9c61aa1: Fix to remove shadowing variables and use socket
    In order to update, you need to apply the following changes in the `api` package:

  `packages/api/src/api.ts`:

  ```diff
      // ...

          res: express.Response,
      ): Promise<void> {
      // Set the request time out to 10 minutes to allow the request enough time to complete.
  -   req.connection.setTimeout(1000 * 60 * 10)
  +   req.socket.setTimeout(1000 * 60 * 10)
      const rawRequest: RawRequest = {
          startDate: req.query.start?.toString(),
          endDate: req.query.end?.toString(),

      // ...

      try {
          const emissionsResults: EmissionsRatios[] = Object.values(
          CLOUD_PROVIDER_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
  -     ).reduce((result, cloudProvider) => {
  -       return Object.keys(cloudProvider).reduce((result, key) => {
  -         result.push({ region: key, mtPerKwHour: cloudProvider[key] })
  -         return result
  -       }, result)
  +     ).reduce((cloudProviderResult, cloudProvider) => {
  +       return Object.keys(cloudProvider).reduce((emissionDataResult, key) => {
  +         cloudProviderResult.push({
  +           region: key,
  +           mtPerKwHour: cloudProvider[key],
  +         })
  +         return emissionDataResult
  +       }, cloudProviderResult)
          }, [])
          res.json(emissionsResults)
      } catch (e) {

      // ...
  ```

- b63d8a67: The default `aws-sdk` dependency was bumped to `"^2.890.0"`,
- 26df8df2: updates create app stub server data and linting
  the following changes can be made by running `yarn run lint:fix` in the default-app template directory:

  `packages/create-app/templates/default-app/packages/client/src/dashboard/CarbonComparisonCard.tsx`:

  ```diff
    // ...

    export const toGas = (co2mt: number): number => co2mt * 112.5247230304
    export const toTrees = (co2mt: number): number => co2mt * 16.5337915448

  - export const CarbonComparisonCard: FunctionComponent<CarbonComparisonCardProps> = ({
  -   data,
  - }) => {
  -   const classes = useStyles()
  -   const [selection, setSelection] = useState('miles')
  -   const mtSum: number = sumCO2(data)
  + export const CarbonComparisonCard: FunctionComponent<CarbonComparisonCardProps> =
  +   ({ data }) => {
  +     const classes = useStyles()
  +     const [selection, setSelection] = useState('miles')
  +     const mtSum: number = sumCO2(data)

  -  const milesSum = toMiles(mtSum)
  -  const gasSum = toGas(mtSum)
  -  const treesSum = toTrees(mtSum)
  +    const milesSum = toMiles(mtSum)
  +    const gasSum = toGas(mtSum)
  +    const treesSum = toTrees(mtSum)

  -  const formatNumber = (number: number, decimalPlaces = 0) =>
  -    number.toLocaleString(undefined, { maximumFractionDigits: decimalPlaces })
  +    const formatNumber = (number: number, decimalPlaces = 0) =>
  +      number.toLocaleString(undefined, { maximumFractionDigits: decimalPlaces })

  -  const comparisons: Comparison = {
  -    gas: {
  -      icon: <LocalGasStation className={classes.icon} data-testid="gasIcon" />,
  -      total: gasSum,
  -      textOne: 'CO2 emissions from',
  -      textTwo: 'gallons of gasoline consumed',
  -    },
  -    miles: {
  -      icon: <DriveEta className={classes.icon} data-testid="milesIcon" />,
  -      total: milesSum,
  -      textOne: 'greenhouse gas emissions from',
  -      textTwo: 'miles driven on average',
  -    },
  -    trees: {
  -      icon: <Eco className={classes.icon} data-testid="treesIcon" />,
  -      total: treesSum,
  -      textOne: 'carbon sequestered by',
  -      textTwo: 'tree seedlings grown for 10 years',
  -    },
  -  }
  +    const comparisons: Comparison = {
  +      gas: {
  +        icon: (
  +          <LocalGasStation className={classes.icon} data-testid="gasIcon" />
  +        ),
  +        total: gasSum,
  +        textOne: 'CO2 emissions from',
  +        textTwo: 'gallons of gasoline consumed',
  +      },
  +      miles: {
  +        icon: <DriveEta className={classes.icon} data-testid="milesIcon" />,
  +        total: milesSum,
  +        textOne: 'greenhouse gas emissions from',
  +        textTwo: 'miles driven on average',
  +      },
  +      trees: {
  +        icon: <Eco className={classes.icon} data-testid="treesIcon" />,
  +        total: treesSum,
  +        textOne: 'carbon sequestered by',
  +        textTwo: 'tree seedlings grown for 10 years',
  +      },
  +    }

  -  const updateSelection = (selection: Selection) => {
  -    setSelection(selection)
  -  }
  +    const updateSelection = (selection: Selection) => {
  +      setSelection(selection)
  +    }

  -  const updateButtonColor = (buttonSelection: Selection) => {
  -    return buttonSelection === selection ? 'primary' : 'default'
  -  }
  +    const updateButtonColor = (buttonSelection: Selection) => {
  +      return buttonSelection === selection ? 'primary' : 'default'
  +    }

  -  return (
  -    <Card className={classes.root} id="carbonComparisonCard">
  -      {mtSum ? (
  -        <div>
  -          <CardContent className={classes.topContainer}>
  -            <Typography className={classes.title} gutterBottom>
  -              Your cumulative emissions are
  -            </Typography>
  -            <Typography
  -              className={classes.metricOne}
  -              id="metric-one"
  -              variant="h4"
  -              component="p"
  -              data-testid="co2"
  -            >
  -              {formatNumber(mtSum, 1)} metric tons CO2e
  -            </Typography>
  -            <Typography className={classes.posOne}>
  -              that is equivalent to
  -            </Typography>
  -          </CardContent>
  -          <CardContent className={classes.bottomContainer}>
  -            <CardContent>{comparisons[selection].icon}</CardContent>
  -            <CardContent>
  -              <Typography className={classes.posTwo} variant="h5" component="p">
  -                {comparisons[selection].textOne}
  +     return (
  +       <Card className={classes.root} id="carbonComparisonCard">
  +         {mtSum ? (
  +           <div>
  +             <CardContent className={classes.topContainer}>
  +               <Typography className={classes.title} gutterBottom>
  +                 Your cumulative emissions are
                 </Typography>
                 <Typography
  -                 className={classes.metricTwo}
  -                 variant="h3"
  +                 className={classes.metricOne}
  +                 id="metric-one"
  +                 variant="h4"
                   component="p"
  -                 data-testid="comparison"
  +                 data-testid="co2"
                 >
  -                 {formatNumber(comparisons[selection].total)}
  +                 {formatNumber(mtSum, 1)} metric tons CO2e
                 </Typography>
  -               <Typography className={classes.posTwo} variant="h5" component="p">
  -                 {comparisons[selection].textTwo}
  +               <Typography className={classes.posOne}>
  +                 that is equivalent to
                 </Typography>
               </CardContent>
  -           </CardContent>
  -           <CardActions className={classes.buttonContainer}>
  -             <Button
  -               id="miles"
  -               variant="contained"
  -               color={updateButtonColor('miles')}
  -               size="medium"
  -               onClick={() => updateSelection('miles')}
  -             >
  -               Miles
  -             </Button>
  -             <Button
  -               id="gas"
  -               variant="contained"
  -               color={updateButtonColor('gas')}
  -               size="medium"
  -               onClick={() => updateSelection('gas')}
  -             >
  -               Gas
  -             </Button>
  -             <Button
  -               id="trees"
  -               variant="contained"
  -               color={updateButtonColor('trees')}
  -               size="medium"
  -               onClick={() => updateSelection('trees')}
  -             >
  -               Trees
  -             </Button>
  -           </CardActions>
  -           <Typography className={classes.source} data-testid="epa-source">
  -             Source:{' '}
  -             <Link
  -               href="https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator"
  -               target="_blank"
  -               rel="noopener"
  -               className={classes.sourceLink}
  -             >
  -               EPA Equivalencies Calculator{' '}
  -               <OpenInNew
  -                 fontSize={'small'}
  -                 className={classes.openIcon}
  -               ></OpenInNew>
  -             </Link>
  -           </Typography>
  -         </div>
  -       ) : (
  -         <div>
  -           <CardContent className={classes.topContainer}>
  -             <Typography
  -               className={classes.metricOne}
  -               variant="h4"
  -               component="p"
  -               data-testid="co2"
  -             >
  -               Emissions comparison
  +             <CardContent className={classes.bottomContainer}>
  +               <CardContent>{comparisons[selection].icon}</CardContent>
  +               <CardContent>
  +                 <Typography
  +                   className={classes.posTwo}
  +                   variant="h5"
  +                   component="p"
  +                 >
  +                   {comparisons[selection].textOne}
  +                 </Typography>
  +                 <Typography
  +                   className={classes.metricTwo}
  +                   variant="h3"
  +                   component="p"
  +                   data-testid="comparison"
  +                 >
  +                   {formatNumber(comparisons[selection].total)}
  +                 </Typography>
  +                 <Typography
  +                   className={classes.posTwo}
  +                   variant="h5"
  +                   component="p"
  +                 >
  +                   {comparisons[selection].textTwo}
  +                 </Typography>
  +               </CardContent>
  +             </CardContent>
  +             <CardActions className={classes.buttonContainer}>
  +               <Button
  +                 id="miles"
  +                 variant="contained"
  +                 color={updateButtonColor('miles')}
  +                 size="medium"
  +                 onClick={() => updateSelection('miles')}
  +               >
  +                 Miles
  +               </Button>
  +               <Button
  +                 id="gas"
  +                 variant="contained"
  +                 color={updateButtonColor('gas')}
  +                 size="medium"
  +                 onClick={() => updateSelection('gas')}
  +               >
  +                 Gas
  +               </Button>
  +               <Button
  +                 id="trees"
  +                 variant="contained"
  +                 color={updateButtonColor('trees')}
  +                 size="medium"
  +                 onClick={() => updateSelection('trees')}
  +               >
  +                 Trees
  +               </Button>
  +             </CardActions>
  +             <Typography className={classes.source} data-testid="epa-source">
  +               Source:{' '}
  +               <Link
  +                 href="https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator"
  +                 target="_blank"
  +                 rel="noopener"
  +                 className={classes.sourceLink}
  +               >
  +                 EPA Equivalencies Calculator{' '}
  +                 <OpenInNew
  +                   fontSize={'small'}
  +                   className={classes.openIcon}
  +                 ></OpenInNew>
  +               </Link>
               </Typography>
  -           </CardContent>
  -           <div className={classes.noData}>
  -             <NoDataPage isTop={false} />
  -           </div>
  -         </div>
  -       )}
  -     </Card>
  -   )
  - }
  +        ) : (
  +          <div>
  +            <CardContent className={classes.topContainer}>
  +              <Typography
  +                className={classes.metricOne}
  +                variant="h4"
  +                component="p"
  +                data-testid="co2"
  +              >
  +                Emissions comparison
  +              </Typography>
  +            </CardContent>
  +            <div className={classes.noData}>
  +              <NoDataPage isTop={false} />
  +            </div>
  +          </div>
  +        )}
  +      </Card>
  +    )
  +  }

     type CarbonComparisonCardProps = {
       data: EstimationResult[]

     // ...
  ```

  packages/create-app/templates/default-app/packages/client/src/dashboard/CloudCarbonContainer.tsx:

  ````diff
      // ...

      const { data, loading } = useRemoteService([], startDate, endDate)

  -    const filteredDataResults: FilterResultResponse = useFilterDataFromEstimates(
  -        data,
  -    )
  +    const filteredDataResults: FilterResultResponse =
  +        useFilterDataFromEstimates(data)
      const { filteredData, filters, setFilters } = useFilters(
          data,
          filteredDataResults,

      // ...
  '''

  packages/create-app/templates/default-app/packages/client/src/dashboard/charts/ApexBarChart.tsx:

  ```diff
      // ...

      const [pageData, setPageData] = useState<Page<Entry>>({ data: [], page: 0 })
      const theme = useTheme()

  -    const {
  -        data: emissionsData,
  -        loading: emissionsLoading,
  -    } = useRemoteEmissionService()
  +    const { data: emissionsData, loading: emissionsLoading } =
  +        useRemoteEmissionService()

      const mainTheme = theme.palette.primary.main
      const darkTheme = theme.palette.primary.dark

      // ...
  '''

  packages/create-app/templates/default-app/packages/client/src/dashboard/filters/DateFilter.tsx:

  ```diff
      // ...

          )
      const startDate = filters.dateRange?.startDate || null
      const endDate = filters.dateRange?.endDate || null
  -    const [focusedInput, setFocusedInput] = useState<
  -        'startDate' | 'endDate' | null
  -    >(null)
  +    const [focusedInput, setFocusedInput] =
  +        useState<'startDate' | 'endDate' | null>(null)

      return (
          <StyledWrapper>

      // ...

          )
      }

  -    const isOutsideRange = (start: moment.Moment, end: moment.Moment) => (
  -        current: moment.Moment,
  -            ) => {
  -                return !current.isBetween(start, end, 'day', '[]')
  -            }
  +    const isOutsideRange =
  +        (start: moment.Moment, end: moment.Moment) => (current: moment.Moment) => {
  +            return !current.isBetween(start, end, 'day', '[]')
  +        }

      export default DateFilter

  ````

  packages/create-app/templates/default-app/packages/client/src/dashboard/filters/Filters.ts:

  ```diff
      // ...

          )
      return resultsFilteredByService
        .map((estimationResult) => {
  -        const filteredServiceEstimates = estimationResult.serviceEstimates.filter(
  -          (serviceEstimate) => {
  +        const filteredServiceEstimates =
  +          estimationResult.serviceEstimates.filter((serviceEstimate) => {
              return (
                this.accounts.some(
                  (account) =>

      // ...

                    account.name === serviceEstimate.accountName,
                ) || allAccountsSelected
              )
  -          },
  -        )
  +          })
          return {
            timestamp: estimationResult.timestamp,
            serviceEstimates: filteredServiceEstimates,

      // ...
  ```

  packages/create-app/templates/default-app/packages/client/src/dashboard/filters/OptionChooser/AccountChooser.ts:

  ```diff
      // ...

      protected chooseProviders(): Set<DropdownOption> {
          const desiredSelections: Set<DropdownOption> = new Set()
  -        getCloudProvidersFromAccounts(
  -            this.selections,
  -        ).forEach((cloudProviderOption) =>
  -            desiredSelections.add(cloudProviderOption),
  +        getCloudProvidersFromAccounts(this.selections).forEach(
  +            (cloudProviderOption) => desiredSelections.add(cloudProviderOption),
          )
          return desiredSelections
      }

      // ...
  ```

  packages/create-app/templates/default-app/packages/client/src/dashboard/filters/OptionChooser/ServiceChooser.ts:

  ```diff
    // ...

    protected chooseProviders(): Set<DropdownOption> {
      const desiredSelections: Set<DropdownOption> = new Set()
  -    getCloudProvidersFromServices(
  -      this.selections,
  -    ).forEach((cloudProviderOption) =>
  -      desiredSelections.add(cloudProviderOption),
  +    getCloudProvidersFromServices(this.selections).forEach(
  +      (cloudProviderOption) => desiredSelections.add(cloudProviderOption),
      )
      return desiredSelections
    }

    // ...
  ```

  packages/create-app/templates/default-app/packages/client/src/dashboard/transformData.tsx:

  ```diff
      // ...

          data: EstimationResult[],
      ): FilterResultResponse => {
      const [filteredData] = useState(data)
  -    const [
  -        filterResultResponse,
  -        setFilterResultResponse,
  -    ] = useState<FilterResultResponse>({ accounts: [], services: [] })
  +    const [filterResultResponse, setFilterResultResponse] =
  +        useState<FilterResultResponse>({ accounts: [], services: [] })

      useEffect(() => {
          const serviceEstimates = pluck('serviceEstimates', data).flat()

      // ...
  ```

  packages/create-app/templates/default-app/packages/client/stub-server/co2estimations.json:

  ```diff
      // ...
      {
  +    "emissions": [
  +        {
  +        "region": "us-east-1",
  +        "mtPerKwHour": 0.0004545
  +        },
  +        {
  +        "region": "us-east-2",
  +        "mtPerKwHour": 0.000475105
  +        },
  +        {
  +        "region": "us-west-1",
  +        "mtPerKwHour": 0.000351533
  +        },
  +        {
  +        "region": "us-west-2",
  +        "mtPerKwHour": 0.000351533
  +        },
  +        {
  +        "region": "us-gov-east-1",
  +        "mtPerKwHour": 0.0004545
  +        },
  +        {
  +        "region": "us-gov-west-1",
  +        "mtPerKwHour": 0.000351533
  +        },
  +        {
  +        "region": "af-south-1",
  +        "mtPerKwHour": 0.000928
  +        },
  +        {
  +        "region": "ap-east-1",
  +        "mtPerKwHour": 0.00081
  +        },
  +        {
  +        "region": "ap-south-1",
  +        "mtPerKwHour": 0.000708
  +        },
  +        {
  +        "region": "ap-northeast-3",
  +        "mtPerKwHour": 0.000506
  +        },
  +        {
  +        "region": "ap-northeast-2",
  +        "mtPerKwHour": 0.0005
  +        },
  +        {
  +        "region": "ap-southeast-1",
  +        "mtPerKwHour": 0.0004085
  +        },
  +        {
  +        "region": "ap-southeast-2",
  +        "mtPerKwHour": 0.00079
  +        },
  +        {
  +        "region": "ap-northeast-1",
  +        "mtPerKwHour": 0.000506
  +        },
  +        {
  +        "region": "ca-central-1",
  +        "mtPerKwHour": 0.00013
  +        },
  +        {
  +        "region": "cn-north-1",
  +        "mtPerKwHour": 0.000555
  +        },
  +        {
  +        "region": "cn-northwest-1",
  +        "mtPerKwHour": 0.000555
  +        },
  +        {
  +        "region": "eu-central-1",
  +        "mtPerKwHour": 0.000338
  +        },
  +        {
  +        "region": "eu-west-1",
  +        "mtPerKwHour": 0.000316
  +        },
  +        {
  +        "region": "eu-west-2",
  +        "mtPerKwHour": 0.000228
  +        },
  +        {
  +        "region": "eu-south-1",
  +        "mtPerKwHour": 0.000233
  +        },
  +        {
  +        "region": "eu-west-3",
  +        "mtPerKwHour": 0.000052
  +        },
  +        {
  +        "region": "eu-north-1",
  +        "mtPerKwHour": 0.000008
  +        },
  +        {
  +        "region": "me-south-1",
  +        "mtPerKwHour": 0.000732
  +        },
  +        {
  +        "region": "sa-east-1",
  +        "mtPerKwHour": 0.000074
  +        },
  +        {
  +        "region": "us-central1",
  +        "mtPerKwHour": 0.000540461
  +        },
  +        {
  +        "region": "us-central2",
  +        "mtPerKwHour": 0.000540461
  +        },
  +        {
  +        "region": "us-east1",
  +        "mtPerKwHour": 0.0004545
  +        },
  +        {
  +        "region": "us-east4",
  +        "mtPerKwHour": 0.0004545
  +        },
  +        {
  +        "region": "us-west1",
  +        "mtPerKwHour": 0.000351533
  +        },
  +        {
  +        "region": "us-west2",
  +        "mtPerKwHour": 0.000351533
  +        },
  +        {
  +        "region": "us-west3",
  +        "mtPerKwHour": 0.000351533
  +        },
  +        {
  +        "region": "us-west4",
  +        "mtPerKwHour": 0.000351533
  +        },
  +        {
  +        "region": "asia-east1",
  +        "mtPerKwHour": 0.000509
  +        },
  +        {
  +        "region": "asia-east2",
  +        "mtPerKwHour": 0.00081
  +        },
  +        {
  +        "region": "asia-northeast1",
  +        "mtPerKwHour": 0.000506
  +        },
  +        {
  +        "region": "asia-northeast2",
  +        "mtPerKwHour": 0.000506
  +        },
  +        {
  +        "region": "asia-northeast3",
  +        "mtPerKwHour": 0.0005
  +        },
  +        {
  +        "region": "asia-south1",
  +        "mtPerKwHour": 0.000708
  +        },
  +        {
  +        "region": "asia-southeast1",
  +        "mtPerKwHour": 0.0004085
  +        },
  +        {
  +        "region": "asia-southeast2",
  +        "mtPerKwHour": 0.000761
  +        },
  +        {
  +        "region": "australia-southeast1",
  +        "mtPerKwHour": 0.00079
  +        },
  +        {
  +        "region": "europe-north1",
  +        "mtPerKwHour": 0.000086
  +        },
  +        {
  +        "region": "europe-west1",
  +        "mtPerKwHour": 0.000167
  +        },
  +        {
  +        "region": "europe-west2",
  +        "mtPerKwHour": 0.000228
  +        },
  +        {
  +        "region": "europe-west3",
  +        "mtPerKwHour": 0.000338
  +        },
  +        {
  +        "region": "europe-west4",
  +        "mtPerKwHour": 0.00039
  +        },
  +        {
  +        "region": "europe-west6",
  +        "mtPerKwHour": 0.00001182
  +        },
  +        {
  +        "region": "northamerica-northeast1",
  +        "mtPerKwHour": 0.00013
  +        },
  +        {
  +        "region": "southamerica-east1",
  +        "mtPerKwHour": 0.000074
  +        },
  +        {
  +        "region": "unknown",
  +        "mtPerKwHour": 0.0004108907
  +        },
  +        {
  +        "region": "AP East",
  +        "mtPerKwHour": 0.00081
  +        },
  +        {
  +        "region": "EU West",
  +        "mtPerKwHour": 0.00039
  +        },
  +        {
  +        "region": "IN Central",
  +        "mtPerKwHour": 0.000708
  +        },
  +        {
  +        "region": "UK South",
  +        "mtPerKwHour": 0.000228
  +        },
  +        {
  +        "region": "UK West",
  +        "mtPerKwHour": 0.000228
  +        },
  +        {
  +        "region": "US Central",
  +        "mtPerKwHour": 0.000540461
  +        },
  +        {
  +        "region": "US East",
  +        "mtPerKwHour": 0.0004545
  +        },
  +        {
  +        "region": "US South Central",
  +        "mtPerKwHour": 0.000424877
  +        },
  +        {
  +        "region": "US West",
  +        "mtPerKwHour": 0.000351533
  +        },
  +        {
  +        "region": "US West 2",
  +        "mtPerKwHour": 0.000351533
  +        },
  +        {
  +        "region": "Unknown",
  +        "mtPerKwHour": 0.0004074
  +        }
  +    ],
      "footprint": [
          {
          "timestamp": "2021-03-04T00:00:00.000Z",

      // ...
  ```

  packages/create-app/templates/default-app/packages/client/stub-server/routes.json:

  ```diff
      // ...

      {
  +        "/api/regions/emissions-factors": "/emissions",
          "/api/*": "/$1",
          "/api": "/footprint"
      }
  ```

## 0.3.3

### Patch Changes

- ac8ee553: adds a contributing md file to provide instruction for updating templates
- 7aa471f5: adds an optional command line argument to skip the installation process when creating the app
- b0151b7d: Improves GCP guided-install prompts in the CLI and create-app packages

## 0.3.2

### Patch Changes

- 037de2c4: updates package names

## 0.3.1

### Patch Changes

- eabe800b: updates core package version config

## 0.3.0

### Minor Changes

- f6765cfb: bumps create app to publish new release
- c0cc067a: adds initial create app package
