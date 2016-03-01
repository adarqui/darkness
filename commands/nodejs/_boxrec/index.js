#!/usr/bin/env node

(function() {
  "use strict";

  if (process.argv.length != 3) {
    console.log("usage: boxrec <Id|Name>");
    process.exit(1);
  }

  var
    BoxRec = require('boxrec-pull'),
    boxer = process.argv[2],
    id = -1;

  id = parseInt(boxer, 10);

  if (id >= 0) {
    BoxRec.findById(id, function(err, boxer) {
      printBoxer(boxer);
    });
  } else {
    BoxRec.findByName(boxer, function(err, boxer) {
      printBoxer(boxer);
    });
  }

  var printBoxer = function(js) {
    var strings = [];
    if (js.name !== undefined && js.name !== "") strings.push("name: " + js.name);
    if (js.nickname !== undefined && js.nickname !== "") strings.push("nickname: " + js.nickname);
    strings.push("wins: " + js.record.w + ", losses: " + js.record.l + ", draws: " + js.record.d);

    console.log(strings.join(", "));
  };

}) ();
