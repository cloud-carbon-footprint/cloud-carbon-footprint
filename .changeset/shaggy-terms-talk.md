---
'@cloud-carbon-footprint/create-app': patch
---

updates create app stub server data and linting
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
