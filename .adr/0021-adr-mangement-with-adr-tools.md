# 21. ADR Mangement with adr-tools

Date: 2022-08-24

## Status

Accepted

## Context

Currently our ADR's are maintained in different formats. Some resemble markdown
some do not. Moreover we lacked Status and Dates to our ADRs.

## Decision

Migrate all ADR's to be managed with `adr-tools` (or similar) to keep
them consistent.

## Consequences

Using a common tool to manage our ADR's brings the following benefits:

* Consistency between the ADR's
* Ability to link, mark as 'superseded by' and generate TOCs
* Moving to Markdown makes the ADR's easily readable, specially on github.

To collect all benefits developers are encouraged to use the `adr-tools` set
of scripts.
