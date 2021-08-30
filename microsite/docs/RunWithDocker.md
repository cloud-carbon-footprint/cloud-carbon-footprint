---
id: run-with-docker
title: Run with Docker
---

If you would like to run with Docker, you'll need install docker and docker-compose:

- Install options for docker [here.](https://docs.docker.com/get-docker/)
- Install options for docker-compose (if it doesn’t come bundled with Docker) [here.](https://docs.docker.com/compose/install/)

### Run with docker-compose

1.  Make sure you have configured your `packages/api/.env` file with the environment variables you need for your cloud provider(s).
2.  Ensure you have cloud provider credentials files in the following locations on your filesystem:
    - AWS: `$HOME/.aws/credentials`
    - GCP: `$HOME/.config/gcloud/service-account-keys.json`
3.  Ensure you have saved your environment variables as files on your local file system. Docker compose will use these securely as [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/) at run time, in the ~/.docker/secrets directory. To aid with this, we have a command you can run that does this:

        yarn create-docker-secrets

4.  Remove any secrets in `docker-compose.yml` that you aren’t not using.
5.  Run the application with docker compose:

        docker-compose up

6.  You can then access the dashboard at http://localhost:80

### Run the API as a Docker container

If you would like to only run the API as a docker container, for example to deploy this as a service for your organization, you can pull and run it with these commands:

    docker pull cloudcarbonfootprint/api
        docker run \
        --env-file packages/api/.env \
        --env
    GOOGLE_APPLICATION_CREDENTIALS=/root/.config/gcloud/service-account-keys.json \
        -p 4000:4000 \
        -v $HOME/.aws/credentials:/root/.aws/credentials \
        -v $HOME/.config/gcloud/service-account-keys.json:/root/.config/gcloud/service-account-keys.json \
        cloudcarbonfootprint/api

Then you can access the API at: http://localhost:4000/api/footprint?start=2021-01-01&end=2021-02-01
