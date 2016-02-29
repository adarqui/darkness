#!/bin/sh

cd "${DARK_COMMANDS}"/elixir/_vping
mix run -e 'Vping.vping()'
