Title — Publishing to npm
Decision — We will independently publish each package
Context — In preparation for going open-source, we wanted to independently publish our cli, api, core logic, and frontend packages to npm. This gives flexibility to our users: some might use the cli, some might spin up their own version of thhe api, and others might want to build their own frontend using our components.
Consequences — We moved the cli and core logic out of our server package, and renamed server to api. Each package has its own package.json and is set up to be independently versioned. We also updated our ci to build our instance of the api from source (ie using latest @cloud-carbon-footprint packages), rather than depending on published versions.
