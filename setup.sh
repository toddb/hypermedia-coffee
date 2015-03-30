#!/usr/bin/env bash

#set up local node.js version

node_version=0.10.5

if [ ! -e tmp/nodejs-plugin-$node_version.zip ]
then
    mkdir tmp
    cd tmp
    wget https://s3.amazonaws.com/clickstacks/admin/nodejs-plugin-$node_version.zip
    unzip nodejs-plugin-$node_version.zip
    tar xf node.tar.gz
    mv node-v* ../node_lib
fi

echo ** Now update scripts to include **
echo 'export PATH=$PATH:./node_lib/bin'
