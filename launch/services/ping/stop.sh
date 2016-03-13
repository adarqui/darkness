#!/bin/sh

# stop irc ping daemon
(cd core/go/proto/irc/ping; make kill)
