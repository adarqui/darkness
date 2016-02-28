build: deps
	echo build

deps:
	npm install

run:
	 node dark_executor_nodejs.js "${DARK_CONFIGS}"/redis.json "${DARK_ROOT}"/commands 1>> "${DARK_LOGS}"/nodejs/executor.stdout.log 2>> "${DARK_LOGS}"/nodejs/executor.stderr.log

kill:
	 pkill -f dark_executor_nodejs
