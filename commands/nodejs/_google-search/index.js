#!/usr/bin/env node

(function() {
  "use strict";

  // maybe add optional results argument (argv[3])
  if (process.argv.length != 3) {
    console.error("usage: google-search <search string>");
    process.exit(1);
  }

  var Google = require('google');
  var max_results = 5;

  Google.resultsPerPage = max_results;
  var nextCounter = 0;

  Google(process.argv[2], function (err, next, links){

    if (err) {
      console.error(err);
      process.exit(1);
    }

    if (links === undefined) {
      console.error("No results.");
      process.exit(1);
    }

    for (var i = 0; i < (links.length > max_results ? max_results : links.length); ++i) {
      console.log(links[i].title + ' - ' + links[i].link);
    }

  });
}) ();
