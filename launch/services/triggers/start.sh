#!/bin/sh

# start triggers service
(cd "${DARK_ROOT}/listeners/haskell/triggers"; make build; make run &)
