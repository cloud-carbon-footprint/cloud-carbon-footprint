# Sonarqube

## Pre-requisites:

- Install [Docker](https://www.docker.com/get-started) for your OS:
  > **The SonarQube server will be hosted on docker container with a SonarQube base image**
- Install Sonar-scanner
  - Manually install for the appropriate OS [here](https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/)
  - Use [Homebrew](https://brew.sh/) (**_RECOMMENDED_**)
    ```
     brew install sonar-scanner
    ```
    > You can **skip the last step** if you do this. A brew install automatically links your binaries and makes it available across your terminal sessions
- Append sonar-scanner bin path to PATH variable in respective run-command file **_(.zshrc, .bashrc, etc)_**
  ```
    export PATH=$PATH:$HOME/Downloads/sonar-scanner/bin
  ```

## TL;DR Steps

```
docker run -d --name SonarQube -p 9000:9000 -p 9092:9092 sonarqube

// visit localhost:9000
// login with admin:admin (or whatever default creds are set)
// disable force user authentication in server

cd (. | packages/client | packages/api) //depending which projects you wanna scan
yarn test
yarn sonar:scan

// visit localhost:9000
// see coverage for cloud-carbon-footprint (server)
// see coverage for cloud-carbon-footprint-client
```

## Steps

1. Run SonarQube server
   `docker run -d --name SonarQube -p 9000:9000 -p 9092:9092 sonarqube` >**To verify if the container started without errors, run the commands:
   `docker ps` or ` docker ps -a` to list even the stopped containers**

1. Now you can visit the Admin UI here: http://localhost:9000.
   At first you will be prompted to login. You can find the default credentials are [here](https://docs.sonarqube.org/latest/instance-administration/security/). Initially you will be greeted with an empty dashboard but as you begin scanning the codebase, this dashboard will be populated with two project: the client and the server
1. Before we start scanning, we will need to make some changes in the Admin UI. Given that we are running this locally, there's virtually no need for authentication. `At the top bar, click on Administration > Security then scroll down to "Force User Authentication" and disable it`.
1. Run the test scripts for the projects that you want to analyze. We leverage Jest to generate our test coverage results which is then picked up by the sonar scanner. In order to ensure your coverage is published to the server, you must have run the test script prior to scanning
1. Now we can start scanning! If you want to scan both the client and the server there's a nifty script at the root package.json.
   ```
   yarn sonar:scan
   ```
   > **_if you want to scan a single project._**, you will have to run the same script but in the client and server directory respectively. (i.e.`cd packages/api; yarn sonar:scan`)
1. If all goes well, You should be able to see the log trace while scanner is analyzing each file. **Ensure that you see “EXECUTION SUCCESS” at the end of scanning** for each project (i.e. client, server)
1. Verify the vulnerabilities on the Admin UI http://localhost:9000

© 2021 Thoughtworks, Inc.
