---
id: run-with-docker
title: Run with Docker
---

If you would like to run with Docker, you'll need install docker and docker-compose:

- Docker `brew install --cask docker`
- docker-compose (should be bundled with Docker if you installed it on a Mac)


    docker-compose up
    cd packages/api
    yarn docker:start //creates a docker container named ccf_base
    yarn docker:setup //install dependencies
