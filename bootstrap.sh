#!/bin/bash

if [ $# -ne 1 ] ; then
  export DARK_CONFIGS=`pwd`/config
else
  export DARK_CONFIGS="$1"
fi



#
# env variables
#
export DARK_ROOT="~/build/src/github.com/adarqui/darkness"
export GOPATH="~/build/"



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
