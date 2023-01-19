---
'@cloud-carbon-footprint/cli': patch
---

Fixes groupBy param missing from CLI estimation request, inadvertently causing memory errors when parsing dates during estimation process.
