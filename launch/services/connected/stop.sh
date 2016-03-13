#!/bin/sh

# stop irc connected daemon
(cd "${DARK_ROOT}/core/go/proto/irc/connected"; make kill)
