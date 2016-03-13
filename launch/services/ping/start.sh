#!/bin/sh

# start irc ping daemon
(cd "${DARK_ROOT}/core/go/proto/irc/ping"; make build; make run &)
