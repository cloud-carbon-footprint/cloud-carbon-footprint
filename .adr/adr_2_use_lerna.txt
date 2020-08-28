Title — Use Lerna
Decision — Use Lerna (https://lerna.js.org) to manage packages and scripts for the client and the server
Context — We wanted a consistent way of running linters, formatters, tests, and the packages themselves. We had gaps in some of these behaviors when we introduced the client code to this repository. Lerna covers these gaps.
Consequences — Removal of the scripts directory. In addition, there may be unforeseen bugs and issue that are centered around Lerna that could block us in the future. However, the pros of a consistent codebase outweighs this risk.
