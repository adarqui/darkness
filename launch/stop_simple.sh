#!/bin/bash

# stop irc connected daemon
(cd core/go/proto/irc/connected; make kill)

# stop irc ping daemon
(cd core/go/proto/irc/ping; make kill)

# stop url_metadata resolver daemon
(cd listeners/nodejs/url_metadata; make kill)

# stop relay daemon
(cd core/go/relay; make kill)
