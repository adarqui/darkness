#!/bin/sh

[ -n "$DARK_BUILD" ] || { echo "DARK_BUILD must be set"; exit 1; }

"${DARK_BUILD}/super.sh"
"${DARK_BUILD}/darkness.sh"
"${DARK_BUILD}/langs.sh"
