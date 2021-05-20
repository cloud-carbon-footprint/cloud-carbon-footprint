# @cloud-carbon-footprint/create-app

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
