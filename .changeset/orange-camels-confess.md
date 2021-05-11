---
'@cloud-carbon-footprint/client': patch
---

removes end date env variable:

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
