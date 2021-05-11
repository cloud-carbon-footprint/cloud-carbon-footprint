---
'@cloud-carbon-footprint/api': patch
---

Fix to remove shadowing variables and use socket:

`packages/api/src/api.ts`:

```diff
    // ...

        res: express.Response,
    ): Promise<void> {
    // Set the request time out to 10 minutes to allow the request enough time to complete.
-   req.connection.setTimeout(1000 * 60 * 10)
+   req.socket.setTimeout(1000 * 60 * 10)
    const rawRequest: RawRequest = {
        startDate: req.query.start?.toString(),
        endDate: req.query.end?.toString(),

    // ...

    try {
        const emissionsResults: EmissionsRatios[] = Object.values(
        CLOUD_PROVIDER_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
-     ).reduce((result, cloudProvider) => {
-       return Object.keys(cloudProvider).reduce((result, key) => {
-         result.push({ region: key, mtPerKwHour: cloudProvider[key] })
-         return result
-       }, result)
+     ).reduce((cloudProviderResult, cloudProvider) => {
+       return Object.keys(cloudProvider).reduce((emissionDataResult, key) => {
+         cloudProviderResult.push({
+           region: key,
+           mtPerKwHour: cloudProvider[key],
+         })
+         return emissionDataResult
+       }, cloudProviderResult)
        }, [])
        res.json(emissionsResults)
    } catch (e) {

    // ...
```
