---
'@cloud-carbon-footprint/api': patch
'@cloud-carbon-footprint/create-app': patch
---

updates check for error type

`packages/api/src/api.ts`:

```diff
    // ...

      } catch (e) {
        apiLogger.error(`Unable to process footprint request.`, e)
-       if (e instanceof EstimationRequestValidationError) {
+       if (
+          e.constructor.name ===
+          EstimationRequestValidationError.prototype.constructor.name
+       ) {
          res.status(400).send(e.message)
-       } else if (e instanceof EstimationRequestValidationError) {
+       } else if (
+          e.constructor.name === PartialDataError.prototype.constructor.name
+       ) {
          res.status(416).send(e.message)
        } else res.status(500).send('Internal Server Error')

    // ...
```
