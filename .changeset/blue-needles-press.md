---
'@cloud-carbon-footprint/client': patch
---

Fixes issue with labels for emission breakdown chart being cut off:

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
