#!/usr/bin/env bash

node_version=0.11.7

if [ ! -e nodejs-plugin-$node_version.zip ]
then
    wget https://s3.amazonaws.com/clickstacks/admin/nodejs-plugin-$node_version.zip
    unzip nodejs-plugin-$node_version.zip
    tar xf node.tar.gz
    mv node-v* node_lib
fi

export PATH=$PATH:$WORKSPACE/node_lib/bin
export PATH=$PATH:$WORKSPACE/node_modules/.bin
