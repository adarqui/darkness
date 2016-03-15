#!/usr/bin/env node

(function() {

  "use strict";

  var usage = function() {
    console.error("usage: wea <zipcode>");
    process.exit(1);
  };

  var
    Weather = require("weather-zip"),
    FS = require("fs")
    ;

  if (process.env.DARK_CMD === undefined) {
    console.error("$DARK_CMD path not set.");
    process.exit(1);
  }

  var
    argv,
    forecastio_key,
    weather,
    zip
    ;

  argv = process.argv;
  if (argv.length != 3) {
    usage();
  }

  zip = argv[2];

  try {
    forecastio_key = FS.readFileSync(process.env.DARK_CMD + "/etc/keys/forecast.io.txt").toString().trim();
  } catch(err) {
    console.error("API key not found.");
    process.exit(1);
  }

  weather = new Weather(forecastio_key);

  weather.get(zip)
  .then(function (data, err){
    // ugly.. we might need different printers, for example: irc, cli
    // this goes for all darkness commands..
    // this is condensed, abbreviated one line output is suitable for irc
    console.log(
      "(" +
        "currently: " + data.currently.summary + ", " +
        "precip-probability: " + (data.currently.precipProbability * 100) + "%, " +
        "temperature: " + data.currently.temperature + "F, " +
        "humidity: " + (data.currently.humidity * 100) + "%, " +
        "wind-speed: " + data.currently.windSpeed + "mph) " +
      "(minutely: " + data.minutely.summary + ") " +
      "(hourly: " + data.hourly.summary + ") " +
      "(daily: " + data.daily.summary + ")"
    );
  })

  .error(function(err) {
    if (err) {
      console.error("unable to find weather data for " + zip);
      process.exit(1);
    }
  });


}) ();
