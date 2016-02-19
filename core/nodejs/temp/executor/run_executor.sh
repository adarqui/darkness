#!/bin/sh

export NODE_PATH=`pwd`/../../lib/:`pwd`/../../../lib

export CONFIG=../../../../config/redis.json

node dark_executor_nodejs.js "${CONFIG}" "../../../../commands/"
