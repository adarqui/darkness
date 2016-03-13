#!/bin/sh

# start url_metadata resolver daemon
(cd "${DARK_ROOT}/listeners/nodejs/url_metadata"; make build; make run &)
