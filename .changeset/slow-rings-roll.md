---
'@cloud-carbon-footprint/aws': patch
---

Adds check for total running queries in Lambda implementation, with a back off, to avoid hitting concurrent queriy limits
