#!/bin/sh

[ -n "$DARK_BUILD" ] || { echo "DARK_BUILD must be set"; exit 1; }

# temporary script to install stuff
sudo mkdir -p /usr/local
