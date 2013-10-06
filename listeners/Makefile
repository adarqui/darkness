all:
	echo "hi"
	make c_compile

run:
	make node
	make go
	make c_run
	make perl
	make php
	make python
	make ruby

node:
	NODE_PATH=/root/admin/git/libsyscalls/nodejs/ node node.js --dbot_listener &

go:
	GOPATH=/home/root/admin/git/kata/redis_1/golang go run go.go --dbot_listener &

c_compile:
	gcc -ggdb -L/usr/local/lib/ -ljson-c -I /usr/local/include/json-c -Wall -ldl -lhiredis -levent -O3 --std=c99 -D_GNU_SOURCE -I c_libs/hiredis/ c.c -o c

c_clean:
	rm -f c

c_run:
	./c --dbot_listener &

perl:
	perl perl.pl --dbot_listener &

php:
	php php.php --dbot_listener &

python:
	python python.py --dbot_listener &

ruby:
	ruby ruby.rb --dbot_listener &

clean:
	pkill -f dbot_listener
	make c_clean
