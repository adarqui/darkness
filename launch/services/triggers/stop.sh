#!/bin/sh

# stop triggers service
(cd "${DARK_ROOT}/listeners/haskell/triggers"; make kill)
