#!/usr/bin/env bash

cd api
npm install
node_modules/.bin/gulp micro integration

cd ../client
npm install
node_modules/.bin/gulp test default
