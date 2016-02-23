#!/bin/bash

mkdir -p ~/build/github.com/adarqui

export GOPATH=~/build/

(cd ~/build/github.com/adarqui; git clone https://github.com/adarqui/darkness)
