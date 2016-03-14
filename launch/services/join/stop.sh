#!/bin/sh

# stop irc join daemon
(cd "${DARK_ROOT}/core/go/proto/irc/join"; make kill)
