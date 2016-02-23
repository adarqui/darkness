#!/bin/bash

mkdir -p ~/build/github.com/adarqui

export GOPATH=~/build/

cd ~/build/github.com/adarqui

if [ ! -d darkness ] ; then
  git clone https://github.com/adarqui/darkness
else
  cd darkness
  git pull origin master
fi
