#!/bin/sh

if [ $# -ne 1 ] ; then
  exit 1
fi

if [ `echo "$1" | grep '\.'` ] ; then
  exit 1
fi

ls "$1"/*.itxt 2>/dev/null | while read line; do
  basename "${line}" | sed s/"\.itxt"//g
done | xargs
