# 18. End data inclusive in date range

Date: 2022-01-05

## Status

Accepted

## Decision

    1) Include usage data returning from requests inclusive of end date

## Context

    To be consistent across the different cloud providers and usage data sources, when we enter a date range for a request
    we want data to be returned including the dates listed on the date range

## Consequences

    - Data would be returned including the end date specified as opposed to up until the end date 
