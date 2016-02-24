var
  Redis = require("redis"),
  Responder = require("./responder")
  ;



var usage = function() {
  console.log("./dark_listener_url_metadata <config_file>");
  process.exit(1);
};



var main = function(argv, argc) {

  if (argc < 3) {
    usage();
  }

  var conf = require(argv[2]);

  Responder.redisLoop({config: conf});
};



main(process.argv, process.argv.length);
