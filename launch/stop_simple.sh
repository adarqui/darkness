#!/bin/sh

# order matters..
services="connected ping join url_metadata executor triggers relay"

for service in ${services}; do
  (cd "${DARK_ROOT}/launch/services/${service}"; ./stop.sh)
done
