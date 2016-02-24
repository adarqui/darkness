#!/bin/bash

#if [ $# -ne 1 ] ; then
#  export DARK_CONFIGS=`pwd`/config
#else
#  export DARK_CONFIGS="$1"
#fi



#
# env variables
#
#export DARK_ROOT="${HOME}/build/src/github.com/adarqui/darkness"
#export DARK_LOGS="${DARK_ROOT}/logs"
#export GOPATH="${HOME}/build/"
#export NODE_PATH="${DARK_ROOT}/core/nodejs/lib/"

source bootstrap.env-only.sh "$1"



#
# setup everything
#
mkdir -p ~/build/src/github.com/adarqui

cd ~/build/src/github.com/adarqui

if [ ! -d darkness ] ; then
  git clone https://github.com/adarqui/darkness
else
  cd darkness
  git pull origin master
fi
