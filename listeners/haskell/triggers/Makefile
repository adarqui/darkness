build:
	stack build
	stack install --local-bin-path ./bin

build-watch:
	stack build --file-watch

clean:
	stack clean

test:
	stack test

deps:
	apt-get -y install sqlite3

run:
	./bin/dark-listener-haskell-triggers "${DARK_CONFIGS}/triggers.json" 1>> "${DARK_LOGS}/haskell/triggers.stdout.log" 2>> "${DARK_LOGS}/haskell/triggers.stderr.log"

kill:
	pkill -f dark-listener-haskell-triggers
