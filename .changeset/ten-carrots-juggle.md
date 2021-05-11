---
'@cloud-carbon-footprint/client': patch
---

Fixes spacing and alignment issues for right-sided axes for the Cloud Usage graph:

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
