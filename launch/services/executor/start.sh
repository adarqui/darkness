#!/bin/sh


# start command executor
(cd "${DARK_ROOT}/core/nodejs/temp/executor"; make build; make run &)
