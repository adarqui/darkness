#!/bin/sh

# start relay daemon
(cd "${DARK_ROOT}/core/go/relay"; make build; make run &)
