---
'@cloud-carbon-footprint/client': minor
---

Indicates Cloud Provider on the Emissions Breakdown Bar Chart:

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
