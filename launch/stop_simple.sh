#!/bin/bash

# stop irc connected daemon
(cd core/go/proto/irc/connected; make kill)

# stop relay daemon
(cd core/go/relay; make kill)
