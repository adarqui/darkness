build: deps
	echo build

deps:
	npm install

run:
	forever dark_listener_nodejs_url_metadata.js "${DARK_CONFIGS}/redis.json" 1>> "${DARK_LOGS}/nodejs/url_metadata.stdout.log" 2>> "${DARK_LOGS}/nodejs/url_metadata.stderr.log"

kill:
	pkill -f dark_listener_nodejs_url_metadata
