#!/bin/sh

[ -n "$DARK_BUILD" ] || { echo "DARK_BUILD must be set"; exit 1; }

for lang in "idris"; do
  "${DARK_BUILD}/langs/idris/super.sh"
  "${DARK_BUILD}/langs/idris/dark.sh"
done
