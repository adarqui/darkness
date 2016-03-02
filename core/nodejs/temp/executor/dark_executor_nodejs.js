(function() {
  "use strict";

var
  Redis = require("redis"),
  Responder = require("./responder")
  ;



var usage = function() {
  console.log("./dark_nodejs_executor.js <redis_config_file> <executor_config_file>");
  process.exit(1);
};



var main = function(argv, argc) {

  if (argc < 4) {
    usage();
  }

  var redis_config = require(argv[2]);
  var executor_config = require(argv[3]);
  console.log(redis_config, executor_config);

  Responder.redisLoop(redis_config, executor_config);
};



main(process.argv, process.argv.length);

}) ();
