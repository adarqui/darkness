build: deps
	go build -o dark_go_relay

deps:
	go get github.com/satori/go.uuid
	go get github.com/op/go-logging

run:
	./dark_go_relay --redis-config ${DARK_CONFIGS}/redis.json --relay-config ${DARK_CONFIGS}/relay.json 1>> ${DARK_LOGS}/go/relay.stdout.log 2>> ${DARK_LOGS}/go/relay.stderr.log

kill:
	pkill -f dark_go_relay
