#!/usr/bin/env bash

export PATH="$PATH:${DARK_ROOT}/listeners/haskell/triggers/bin"

if (( $# < 2)) ; then
  echo "usage: ${0##*/} <search_by:{key,value,author}> <keywords>" && exit 1
fi

search_by=`echo "$1" | tr '[:upper:]' '[:lower:]'`
shift
keywords="$@"

if [[ "${search_by}" != "key" && "${search_by}" != "value" && "${search_by}" != "author" ]]; then
  echo 'search_by must be either: key, value, or author' && exit 1
fi

label="${DARK_EXEC_SERVER_LABEL}"
channel="${DARK_EXEC_IRC_CHANNEL#\#}"
nick="${DARK_EXEC_IRC_NICK}"
ns="${label}:${channel}"

result=`triggers-cli search-triggers "${ns}" "${keywords}" "${search_by}" 2>/dev/null`

if (( $? != 0 )) || [ "${result}" == "[]" ]; then
  echo "search criteria not found."
  exit 1
fi

count=`echo "${result}" | jq 'length'`
echo "${count}"
