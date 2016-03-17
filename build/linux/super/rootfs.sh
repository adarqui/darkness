#!/bin/sh

[ -n "$DARK_BUILD" ] || { echo "DARK_BUILD must be set"; exit 1; }

sudo rsync -av "${DARK_BUILD}/rootfs/" /
