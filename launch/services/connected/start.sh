#!/bin/sh

# start irc connected daemon
(cd "${DARK_ROOT}/core/go/proto/irc/connected"; make build; make run &)
