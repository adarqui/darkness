#!/bin/sh

# stop url_metadata resolver daemon
(cd "${DARK_ROOT}/listeners/nodejs/url_metadata"; make kill)
