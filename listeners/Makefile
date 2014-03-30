all:
	make compile_c

run:
	make run_node
	make run_go
	make run_c
	make run_perl
	make run_php
	make run_python
	make run_ruby

deps:
	apt-get install curl libevent-dev
	make deps_hiredis
	make deps_jsonc

run_node:
	NODE_PATH=./node_modules/libsyscalls/nodejs/ node node.js --dbot_listener &

run_go:
	GOPATH=/home/root/admin/git/kata/redis_1/golang go run go.go --dbot_listener &

compile_c:
	gcc -ggdb -L/usr/local/lib/ -ljson -I /usr/local/include -Wall -ldl -lhiredis -levent -O3 --std=c99 -D_GNU_SOURCE c.c -ldl -lhiredis -ljson -o c

clean_c:
	rm -f c

run_c:
	./c --dbot_listener &

run_perl:
	perl perl.pl --dbot_listener &

run_php:
	php php.php --dbot_listener &

run_python:
	python python.py --dbot_listener &

run_ruby:
	ruby ruby.rb --dbot_listener &

clean:
	pkill -f dbot_listener
	make c_clean

deps_hiredis:
	./installers/hiredis

deps_jsonc:
	./installers/jsonc

deps_go:
	./installers/go

deps_ruby:
	./installers/ruby

deps_php:
	./installers/php

deps_scala:
	./installers/scala

deps_perl:
	./installers/perl

deps_haskell:
	./installers/haskell

deps_prolog:
	./installers/prolog

deps_fortran:
	./installers/fortran

deps_node:
	./installers/node
