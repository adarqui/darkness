#!/bin/bash

# order matters..

# start irc connected daemon
(cd core/go/proto/irc/connected; make build; make run &)

# start irc ping daemon
(cd core/go/proto/irc/ping; make build; make run &)

# start url_metadata resolver daemon
(cd listeners/nodejs/url_metadata; make build; make run &)

# start command executor
(cd core/nodejs/temp/executor; make build; make run &)

# start relay daemon
(cd core/go/relay; make build; make run &)
