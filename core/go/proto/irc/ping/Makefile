build: deps
	go build -o dark_go_irc_ping

deps:
	echo deps

run:
	./dark_go_irc_ping --redis-config ${DARK_CONFIGS}/redis.json 1>> ${DARK_LOGS}/go/ping.stdout.log 2>> ${DARK_LOGS}/go/ping.stderr.log

kill:
	pkill -f dark_go_irc_ping
