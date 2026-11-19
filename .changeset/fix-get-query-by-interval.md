---
'@cloud-carbon-footprint/aws': patch
---

Fix an infinite loop in `getQueryByInterval` that froze the interval dates and could exhaust memory for ranges longer than the interval.
