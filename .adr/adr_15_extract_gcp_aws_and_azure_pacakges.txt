Title — Extract gcp, aws and azure packages
Decision — Create three new packages called aws, gcp and azure. Each package contains the cloud provider specific data that once lived in the core and app packages. Each package will have app as a dependant and common and core as dependencies.
Context — We wanted to extract the cloud provider specific logic into packages specific to each cloud provider. Now the core package only contains the core business logic and each cloud provider package can hold its specific data and features.
Consequences
— We now have more packages to manage and reason about. They are smaller in size though, so hopefully this doesn't become unmanageable.
- The CI/CD pipeline has been updated to scale as we add more packages that are dependant on each other.
- As we further evolve the application, it now makes more sense for cloud provider specific features (ie. recommendation components) to live in each respective cloud provider package.
