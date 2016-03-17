#!/bin/sh

[ -n "$DARK_BUILD" ] || { echo "DARK_BUILD must be set"; exit 1; }

"${DARK_BUILD}/super/init.sh"
"${DARK_BUILD}/super/packages.sh"
"${DARK_BUILD}/super/rootfs.sh"
