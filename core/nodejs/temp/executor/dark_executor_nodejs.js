var
  Redis = require("redis"),
  Responder = require("./responder")
  ;



var usage = function() {
  console.log("./dark_nodejs_interp_scheme <config_file> <commands_path>");
  process.exit(1);
}



var main = function(argv, argc) {

  if (argc < 4) {
    usage();
  }

  var conf = require(argv[2]);
  var commands_path = argv[3];
  console.log(conf);

  Responder.redisLoop({config: conf, commands: commands_path});
}



main(process.argv, process.argv.length);
