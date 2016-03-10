#!/bin/bash

opt_n=1;
start_index=0;
argv=("$@");

if [ $1 = "-n" ]; then
  if (( $# == 1 )) ; then
    exit 0;
  fi
  opt_n=0;
  (( start_index+=1 ));
  shift
fi

for index in `seq $start_index $#`; do
  printf "%s" ${argv[$index]}
  if (( index != $# )); then
    printf " ";
  fi
done

# print newline if -n wasn't passed
if (( opt_n )) ; then
  printf "\n"
fi
