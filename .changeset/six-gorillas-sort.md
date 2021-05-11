---
'@cloud-carbon-footprint/client': patch
---

Fixes shifting of the bars on the Emissions Breakdown BarChart:

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
