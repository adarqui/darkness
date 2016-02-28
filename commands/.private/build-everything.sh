#!/bin/bash

DIRECTORIES=`find . -name Makefile | egrep -iv "node_modules"`

find . -name Makefile | egrep -iv "node_modules" | while read dir; do
  base=`dirname "${dir}"`
  (cd "$base"; make build)
done
