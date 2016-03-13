#!/bin/sh

# stop irc ping daemon
(cd "${DARK_ROOT}/core/go/proto/irc/ping"; make kill)
