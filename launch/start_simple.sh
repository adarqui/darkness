#!/bin/bash

# start relay daemon
(cd core/go/relay; make build; make run &)
