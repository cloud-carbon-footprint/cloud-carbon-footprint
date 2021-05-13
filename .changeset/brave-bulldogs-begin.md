---
'@cloud-carbon-footprint/client': patch
'@cloud-carbon-footprint/core': patch
'@cloud-carbon-footprint/create-app': patch
---

#244 Bug fixed by changing configs boolean conditionals:
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
