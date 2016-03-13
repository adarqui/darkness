#!/bin/sh

# start url_metadata resolver daemon
(cd listeners/nodejs/url_metadata; make build; make run &)
