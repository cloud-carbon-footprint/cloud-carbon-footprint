# @cloud-carbon-footprint/client

This package provides the front end dashboard used by Cloud Carbon Footprint plugins and apps.

## Installation

Install the package via npm or Yarn:

```sh
$ npm install --save @cloud-carbon-footprint/client
```

or

```sh
$ yarn add @cloud-carbon-footprint/client
```

## Development

### Running Locally

Please refer to the [documentation](https://www.cloudcarbonfootprint.org/docs/introduction) on how to run the client locally.

### Running Locally with Mock Data

Please refer to the [documentation](https://www.cloudcarbonfootprint.org/docs/run-with-mocked-data) on how to run the client locally with mock data.

### Building

There are 2 ways to build this package.

1. As an application
    - `yarn build:app` uses `react-scripts` to build a production-ready client app
    - The results are placed in `./build`
    - `ci.yml` uses `build:app` in the `build-client` step of the `build` job
2. As a library
    - `yarn build` uses `tsc` to transpile the source and create type definitions
    - The results are placed in `./dist`
    - `ci.yml` uses `yarn build` in the `build packages` step of the `release` job

## Documentation

- [Cloud Carbon Footprint Readme](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/README.md)
- [Cloud Carbon Footprint Documentation](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/tree/trunk/microsite/docs/README.md)

## License

© 2021 Thoughtworks, Inc.
