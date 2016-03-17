#!/bin/sh

[ -n "$DARK_BUILD" ] || { echo "DARK_BUILD must be set"; exit 1; }

if [ ! "`which idris`" ] ; then
  stack update
  stack install idris --local-bin-path=/usr/local/bin
fi
