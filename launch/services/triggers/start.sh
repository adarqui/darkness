#!/bin/sh

# start triggers service
(cd listeners/haskell/triggers; make build; make run &)

