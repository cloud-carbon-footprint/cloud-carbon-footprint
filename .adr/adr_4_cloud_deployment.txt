# Cloud Deployment

## Decision
    1) Host application using Google App Engine (GAE) with 2 services:
        - default: static client assets served by express
        - server: Footprint API served by express
    2) Use container images as application artifacts

## Context
We wanted to use GAE because it provides a stable, public URL backed by a secure load balancer, as well as serverless compute.

In general, we value the following:
    - low cost & carbon footprint
    - low operational complexity
    - portability

## Consequences
    - The application is accessible by the public
    - We have a lot of metrics and logging out of the box
    - Every successful pipeline run will create and store 2 images, which costs money
        - The current ~100 images currently in the container registry would cost about $0.07 a month.
    - There is no more dedicated compute instance (or associated networking)
    - Application artifacts are generally reusable in other container-based environments

