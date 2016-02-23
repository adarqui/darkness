#!/bin/sh

export NODE_PATH=`pwd`/../../../core/nodejs/lib/

export CONFIG=../../../config/redis.json

node dark_listener_url_metadata.js "${CONFIG}"
