#!/usr/bin/env bash

cd server
npm run start:cli -- "$@"
cd ..
