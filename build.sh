#!/usr/bin/env bash

cd api
npm install
node_modules/.bin/gulp micro
node_modules/.bin/gulp integration
# need to acceptance tests
# node_modules/.bin/gulp acceptance

cd ../client
npm install
node_modules/.bin/bower update
node_modules/.bin/gulp build
# need tests
# node_modules/.bin/gulp test-travis
