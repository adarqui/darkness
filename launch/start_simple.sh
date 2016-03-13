#!/bin/sh

# order matters..
services="connected ping url_metadata executor triggers relay"

for i in ${services}; do
  (cd services/$i; ./start.sh)
done
