#!/usr/bin/env bash

pushd server
npm run start:cli -- "$@"
popd
