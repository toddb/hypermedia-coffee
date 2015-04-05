#!/usr/bin/env bash

cd api
npm install
# tests must be run separately rather as one set of tasks
node_modules/.bin/gulp micro
node_modules/.bin/gulp integration
node_modules/.bin/gulp acceptance

cd ../client
npm install
node_modules/.bin/bower update
node_modules/.bin/gulp build
node_modules/.bin/gulp test-travis
