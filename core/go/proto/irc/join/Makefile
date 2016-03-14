build: deps
	go build -o dark_go_irc_join

deps:
	echo deps

run:
	./dark_go_irc_join --redis-config "${DARK_CONFIGS}/redis.json" --connected-config "${DARK_CONFIGS}/proto/irc/connected.json" 1>> "${DARK_LOGS}/go/join.stdout.log" 2>> "${DARK_LOGS}/go/join.stderr.log"

kill:
	pkill -f dark_go_irc_join
