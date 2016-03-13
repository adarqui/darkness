#!/bin/sh


# start command executor
(cd core/nodejs/temp/executor; make build; make run &)
