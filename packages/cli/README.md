# @cloud-carbon-footprint/cli

This package provides a Command Line Interface as an entrypoint to get cloud energy and carbon emissions.

## Installation

Install the package via npm or Yarn:

```sh
$ npm install --save @cloud-carbon-footprint/cli
```

or

```sh
$ yarn add @cloud-carbon-footprint/cli
```

## Development

### Running Locally

Please refer to the [documentation](https://www.cloudcarbonfootprint.org/docs/running-the-cli) on how to run the cli locally.

### Guided Install

```
yarn guided-install
```

This will install dependencies for all packages, then guide you through setting up credentials and environment variables to analyze the footprint of your AWS, GCP, or Azure account. Then:

```
yarn start
```

If you have any problems with the guided install, you can instead [configure your cloud provider environment variables manually](https://www.cloudcarbonfootprint.org/docs/introduction#connecting-your-data).

## Documentation

- [Cloud Carbon Footprint Readme](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/README.md)
- [Cloud Carbon Footprint Documentation](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/tree/trunk/microsite/docs/README.md)

## License

© 2021 Thoughtworks, Inc.
