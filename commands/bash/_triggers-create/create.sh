#!/usr/bin/env bash

export PATH="$PATH:${DARK_ROOT}/listeners/haskell/triggers/bin"

if (( $# <= 1 )) ; then
  echo "usage: ${0##*/} <key> value for key.." && exit 1
fi

key="${1}"
shift
value="$@"

user_info="${DARK_EXEC_IRC_USER}"
label="${DARK_EXEC_SERVER_LABEL}"
channel="${DARK_EXEC_IRC_CHANNEL#\#}"
nick="${DARK_EXEC_IRC_NICK}"
ns="${label}:${channel}"

value=`triggers-cli create-trigger "${ns}" "${key}" "${value}" "${nick}" "${user_info}" 2>/dev/null`

if (( $? != 0 )) ; then
  echo "unable to add key."
  exit 1
fi

echo "${key} successfully added."
