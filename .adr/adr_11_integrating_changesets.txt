Title — Integrating changesets
Decision — We will use changesets for versioning with action scripts to automate github releases/tags and publishing packages to npm
Context — In preparation for going open-source, we wanted to create a more structured versioning process. Changesets allows for organized semantic versioning updates and helps integrate automation for releasing and publishing.
Consequences — After a feature is finished or an external contribution is made, a user will manually run the changeset command to pick which and how the packages should be updated. Changesets automates the creation of a PR which will be reviewed and merged on a regular basis.
