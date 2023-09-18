# 17. Refactor Filters for Reusability

Date: 2021-09-30

## Status

Accepted

## Decision

Move the filters and its core logic inside the client package to the client's
common folder, and refactor its logic to no longer be specific to the Emissions
Metrics Page.

## Context

We needed to implement a similar filters feature on the newly created
Recommendations page. Refactoring the logic of the existing filter allowed for
easy adoption of the current components that we have, as well as for easy reuse
of the filters' logic in the future in case it's needed elsewhere.

## Consequences

- Implementing new filters will require understanding the current architecture and creating appropriate subclasses and
subcomponents
- Any pages using the filters' architecture can now follow the same pattern and share the same core logic
- Filters setup may cause a lot of overhead for simple use cases, and logic is coupled to the filter bar
(no customizable styling)
