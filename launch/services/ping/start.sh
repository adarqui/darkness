#!/bin/sh

# start irc ping daemon
(cd core/go/proto/irc/ping; make build; make run &)
