var
  OptParse = require("optparse"),
  Urban = require("urban")
;



var banner = "Usage: ./urban [options]";

var options = {
  examples: false,
  json: false,
  nth: 0,
  random: true,
  total: false,
  verbose: false,
};



var switches = [
  ["-h", "--help", "Shows help sections"],
  ["-e", "--examples", "Shows an example instead of a definition"],
  ["-f", "--first", "Shows the first definition for the specified search term"],
  ["-j", "--json", "Shows the full JSON output on one line"],
  ["-n", "--nth NUMBER", "Shows the nth definition for the specified search term"],
  ["-r", "--random", "Shows a random definition for the specified search term"],
  ["-t", "--total", "Shows the total number of definitions for the specified search term"],
  ["-v", "--verbose", "Shows verbose information about the specified search term"],
];



var process = function(argv) {

  var arg;

  var parser = new OptParse.OptionParser(switches);

  parser.on("help", function() {
    console.log(switches);
  });

  parser.on("examples", function(k, v) {
    options.examples = true;
  });

  parser.on("first", function(k, v) {
    options.random = false;
    options.nth = 0;
  });

  parser.on("json", function(k, v) {
    options.json = true;
  });

  parser.on("nth", function(k, v) {
    options.random = false;
    options.nth = (v-1);
  });

  parser.on("random", function(k, v) {
    options.random = true;
  });

  parser.on("total", function(k, v) {
    options.total = true;
  });

  parser.on("verbose", function(k, v) {
    options.verbose = true;
  });

  parser.on(2, function(value) {
    arg = value;
  });

  parser.banner = banner;
  parser.parse(argv);

  if (options.nth < 0) {
    console.log("nth cannot be < 0");
    return;
  }

  if (arg != undefined) {
    var lookup = Urban(arg);

    if (options.total == true) {
      lookup.results(function(json) {
        console.log(json.length);
      });
    }

    else if (options.random == true) {
      lookup.results(function(json) {
        printResult(json[randomArrayIndex(json)], options);
      });
    }

    else if (options.random == false) {
      lookup.results(function(json) {
        var def = json[options.nth];
        printResult(def, options);
      });
    }

  }
}



var printResult = function(v, opts) {
  if (opts.examples == true) {
    console.log(v.example);
  } else {
    if (opts.json == true) {
      console.log(v);
    } else {
      console.log(v.definition);
    }
  }
}



var randomArrayIndex = function(arr) {
  return (Math.floor(Math.random() * 100) % arr.length);
}



module.exports = {
  Process: process
}
