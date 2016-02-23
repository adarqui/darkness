#!/bin/bash

# start relay daemon
(cd core/go/relay; make build; make run &)

# start irc connected daemon
(cd core/go/proto/irc/connected; make build; make run &)
