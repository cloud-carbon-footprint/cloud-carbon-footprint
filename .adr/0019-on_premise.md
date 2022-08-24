# 19. Implement on-premise estimations

Date: 2022-03-01

## Status

Accepted

## Context

We want consumers to be able to provide their on-premise usage data and
calculate energy and co2e emissions associated with running their local
servers.

## Decision

Create a new package called on-premise. This package contains the logic to
estimate on-premise co2e and energy based upon the existing core logic.

## Consequences

Technically, this does not follow the relevancy of "cloud" carbon footprint,
but it can be useful in determining the emissions saving associated with a
migration from on-premise to cloud.

Based on the data structure provided from the usage input, there is not a
great way to convert the response to be in the same format as the cloud
footprint API to be consumed in the same client side time series charts.
