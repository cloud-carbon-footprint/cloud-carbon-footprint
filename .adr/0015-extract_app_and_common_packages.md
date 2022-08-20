Title — Extract app and common packages
Decision — Create two new packages called app and common. The app package contains the logic to run the application and is a dependancy of api/cli. The common package is for functionality that is shared across multiple packages.
Context — We want to eventually extract the cloud provider specific logic into packages specific to each cloud provider. This change will make this easier so we can avoid circular dependancies.
Consequences
— We now have more packages to manage and reason about. They are smaller in size though, so hopefully this doesn't become unmanagable.
- The CI/CD pipeline has been updated to scale as we add more packages that are dependant on each other.
- This will make extracting the cloud provider functionality to their own packages easier, out of the app and core packages.
