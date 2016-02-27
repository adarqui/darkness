build:
	# oasis quickstart
	oasis setup
	ocaml setup.ml -configure --prefix ./install
	ocaml setup.ml -build
	ocaml setup.ml -install
	mv install/bin/vping ./

clean:
	ocaml setup.ml -clean

run:
	./install/bin/vping
