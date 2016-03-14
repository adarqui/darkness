#!/usr/bin/env escript
main(Argv) ->
  Argc = length(Argv),
  io:fwrite("~.10B~n", [Argc]).
