build: deps
	go build -o dark_go_irc_connected

deps:
	echo deps

run:
	./dark_go_irc_connected --redis-config ${DARK_CONFIGS}/redis.json --connected-config ${DARK_CONFIGS}/proto/irc/connected.json 1>> ${DARK_LOGS}/go/connected.stdout.log 2>> ${DARK_LOGS}/go/connected.stderr.log

kill:
	pkill -f dark_go_irc_connected
