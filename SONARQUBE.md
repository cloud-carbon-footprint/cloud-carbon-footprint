# Sonarqube

## Pre-requisites:
* Have docker up and running locally

## Steps
1. Run SonarQube server inside the Docker container.
1. To run SonarQube server, run the below command on the terminal to start.
  `docker run -d --name SonarQube -p 9000:9000 -p 9092:9092 sonarqube`
1. To verify if the container started without errors, run the commands:
`docker ps` or ` docker ps -a` to list even the stopped containers
1. Go inside the Sonaqube container
`docker exec -it SonarQube bash`
1. Make sure the JS plugin is listed
`ls extensions/plugins/` then `exit` the container
1. To view the Admin UI for the SonarQube-server, hit this URL on the browser http://localhost:9000 which might prompt you to login. 
Credentials are [here](https://docs.sonarqube.org/latest/instance-administration/security/)
1. Download the SonarQube-Scanner for the appropriate OS from [here](https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/).
1. SonarQube Scanner needs a way to communicate with SonarQube-server for publishing and processing the analyzed results
```
cd sonar-scanner
sonar-scanner $ vi conf/sonar-scanner.properties
```
1. Add the address of the SonarQube server
`sonar.host.url=http://localhost:9000`
1. Add the sonar-scanner binary to PATH to your profile files(.zshrc, .bash-profile, etc)
`export PATH=$PATH:$HOME/Downloads/sonar-scanner/bin`
1. Add a configuration file inside the React project root directory. This is to ensure that SonarQube-Scanner can find this config file and start analyzing.
`touch sonar-project.properties`
1. Add the following properties in the file
```
sonar.projectKey=cloud-carbon-footprint 
sonar.projectName=cloud-carbon-footprint 
sonar.projectVersion=1.0
sonar.sources=client/src
sonar.sourceEncoding=UTF-8
```
1. Start scanning the code base using the below command from within the project root directory
`$ sonar-scanner`. This might complain because of Auth issues which can be temporarily disabled by 
 going to sonarqube web page, then go to administration, after that go to security and disable " Force User Authentication".
1. If all goes well, You should be able to see the log trace while scanner is analyzing each file. 
    * Ensure that you see “EXECUTION SUCCESS” at the end of scanning
1. Verify the vulnerabilities on the Admin UI http://localhost:9000    

© 2020 ThoughtWorks, Inc. All rights reserved.