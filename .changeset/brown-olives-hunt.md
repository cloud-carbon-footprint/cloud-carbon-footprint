---
'@cloud-carbon-footprint/client': minor
'@cloud-carbon-footprint/create-app': patch
---

Change Carbon equivalency component to be globally relevant

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
