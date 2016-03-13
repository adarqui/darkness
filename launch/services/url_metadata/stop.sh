#!/bin/sh

# stop url_metadata resolver daemon
(cd listeners/nodejs/url_metadata; make kill)
