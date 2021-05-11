---
'@cloud-carbon-footprint/client': minor
---

Updates the formula in the sidebar with new sources for emissions factor:

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
