#!/bin/bash

if [ $# -ne 1 ] ; then
  export DARK_CONFIGS=`pwd`/config
else
  export DARK_CONFIGS="$1"
fi



#
# env variables
#
export DARK_ROOT="${HOME}/build/src/github.com/adarqui/darkness"
export DARK_LOGS="${DARK_ROOT}/logs"
export GOPATH="${HOME}/build/"
export NODE_PATH="${DARK_ROOT}/core/nodejs/lib/"
