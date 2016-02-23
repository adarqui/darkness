#!/bin/bash

# stop relay daemon
(cd core/go/relay; make kill)

# stop irc connected daemon
(cd core/go/proto/irc/connected; make kill)
