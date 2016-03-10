#!/bin/sh

if [ $# -ne 1 ] ; then
  exit 1
fi

if [ `echo "$1" | grep '\.'` ] ; then
  exit 1
fi

if [ ! -f "$1".itxt ] ; then
  exit 1
fi

cat "$1".itxt
