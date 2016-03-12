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
export DARK_DATA="${DARK_ROOT}/data"
export DARK_LOGS="${DARK_ROOT}/logs"
export DARK_CMD="${DARK_ROOT}/commands"
export DARK_CMD_PRIVATE="${DARK_ROOT}/commands_private"

export GOPATH="${HOME}/build/"
export NODE_PATH="${DARK_ROOT}/core/nodejs/lib/"
