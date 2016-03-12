#!/bin/bash

# stop irc connected daemon
(cd core/go/proto/irc/connected; make kill)

# stop irc ping daemon
(cd core/go/proto/irc/ping; make kill)

# stop url_metadata resolver daemon
(cd listeners/nodejs/url_metadata; make kill)

# stop command executor
(cd core/nodejs/temp/executor; make kill)

# stop triggers service
(cd listeners/haskell/triggers; make kill)

# stop relay daemon
(cd core/go/relay; make kill)
