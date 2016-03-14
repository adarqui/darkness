#!/usr/bin/env escript

intersperse(_, [])    -> [];
intersperse(_, [L])   -> [L];
intersperse(X, [H|T]) -> [H, X | intersperse(X, T)].

main([])   -> ok;
main(Argv) ->
  Argv_ = intersperse(" ", Argv),
  lists:map(
    fun(Arg) -> io:fwrite("~s", [Arg]) end,
    Argv_),
  io:fwrite("~n").
