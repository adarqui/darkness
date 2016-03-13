#!/bin/sh

# stop relay daemon
(cd "${DARK_ROOT}/core/go/relay"; make kill)
