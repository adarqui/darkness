#!/bin/sh

# start irc join daemon
(cd "${DARK_ROOT}/core/go/proto/irc/join"; make build; make run &)
