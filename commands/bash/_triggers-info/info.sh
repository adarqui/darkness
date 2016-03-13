#!/usr/bin/env bash

export PATH="$PATH:${DARK_ROOT}/listeners/haskell/triggers/bin"

if (( $# != 1 )) ; then
  echo "usage: ${0##*/} <key>" && exit 1
fi

key="$1"
label="${DARK_EXEC_SERVER_LABEL}"
channel="${DARK_EXEC_IRC_CHANNEL#\#}"
nick="${DARK_EXEC_IRC_NICK}"
ns="${label}:${channel}"

value=`triggers-cli get-trigger "${ns}" "${key}" "${nick}" 2>/dev/null`

if (( $? != 0 )) ; then
  echo "key not found."
  exit 1
fi

author=`echo "$value" | jq -r .author`
created_at=`echo "$value" | jq -r .created_at`
counter=`echo $value | jq -r .counter`

echo "${author} created ${key} on ${created_at} and it has been accessed ${counter} times."
