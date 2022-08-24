# 20. Adoption of MongoDB

Date: 2022-08-24

## Status

Accepted

## Context

With the use of CCF on larges installations we started to find limits to the
current code implementation. Internally the application assumes that it can
handle all data to perform the calculations. When the data is large enough this
assumption breaks. Typically the error will manifest as `RangeError` under
calls to `JSON.stringfy()`.

To be able to consume the data in chunks and also add ability of efficient 
filtering we considered add backend database. We needed to consider a database
flexible enough to cope of the volatility of Cloud Provider's data and
common enough that it can be used in a diverse set of environments.

## Decision

For the first need, flexible schemas we opted for a document based database. And 
for the second criteria, diverse environment compatibility, we opted for MongoDB.

## Consequences

The adoption of MongoDB will allow us several performance improvements such as:
 * Backend filtering
 * Limiting the amount of data processed
 * Pagination
 * History preservation
