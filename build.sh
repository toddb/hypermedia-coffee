#!/usr/bin/env bash

set -e
GULP=node_modules/.bin/gulp
BOWER=node_modules/.bin/bower

( cd api && npm install )
#( cd api/app && npm install )
# tests must be run separately rather as one set of tasks
( cd api && $GULP micro )
( cd api && $GULP integration )
( cd api && $GULP acceptance )

( cd client ; npm install ; $BOWER update ; $GULP build test )

