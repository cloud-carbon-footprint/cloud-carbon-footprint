---
'@cloud-carbon-footprint/client': patch
'@cloud-carbon-footprint/create-app': patch
---

Updates CarbonFormulaDrawer to link to the microsite

`packages/client/src/dashboard/CarbonFormulaDrawer.tsx`:

```diff
    // ...

        available.
        </Typography>
        <Link
-          href="https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/microsite/docs/Methodology.md"
+          href="https://www.cloudcarbonfootprint.org/docs/methodology"
          target="_blank"
          rel="noopener"
          className={classes.methodology}

    // ...
```
