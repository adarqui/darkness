#!/bin/sh

function join {
  local d=$1;
  shift;
  printf "$1";
  shift;
  printf "%s" "${@/#/$d}";
}



if [ $# -lt 2 ] ; then
  echo "usage: $0 <dir> <file_extension_1> ... <file_extensions_n>";
  echo "ex: $0 ./ .hs .c .purs";
  exit 1;
fi

args=( ${@} );

declare -a arr;
index=0;
for i in ${args[@]:1}; do
  arr[index]="*$i";
  index=$((index+1));
done

extensions="`join ' -or -name ' ${arr[@]}`";

find "$1" -type f \( -name $extensions \) -exec wc -l {} \; | awk '{print $1}' | paste -s -d+ -| bc;
