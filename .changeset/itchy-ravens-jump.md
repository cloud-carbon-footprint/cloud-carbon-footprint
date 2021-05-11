---
'@cloud-carbon-footprint/create-app': patch
---

- b63d8a6: The default `aws-sdk` dependency was bumped to `"^2.890.0"`
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
