#!/usr/bin/env bash

# If you have a local clickstack version of nodejs at node_lib (see setup.sh)
# see https://github.com/CloudBees-community/nodejs-clickstack
export PATH=$PATH:../node_lib/bin

# String together the build steps. (See README.md for details)
# Note: First time you must use npm install

if [ ! -d "./node_modules" ]; then
 npm install
else
 npm update
fi

export PATH=$PATH:./node_modules/.bin

npm start
