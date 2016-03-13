#!/bin/sh

# stop irc connected daemon
(cd core/go/proto/irc/connected; make kill)
