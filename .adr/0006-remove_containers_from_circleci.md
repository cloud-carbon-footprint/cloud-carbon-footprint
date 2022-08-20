Title: Remove Containers from CircleCI
Decision:
    - Remove Docker image creation and publishing as part of the CircleCI build pipeline.
    - Keep Dockerfiles in the client and server packages to use locally, or if we want to use Docker images again in the build pipeline later.
Context:
    - Google Cloud Platform have deprecated support for Docker images in Google App Engine Standard.
    - We want to keep the benefits of serverless infrastructure (elasticity & faster deploy time) that App Engine Standard provides
Consequences:
    - If we want to deploy Containers again the the future, we will need to re-add the creation and publishing to a container registry.
