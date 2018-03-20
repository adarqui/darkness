#!/usr/bin/env node

// this cmd uses the api @ https://developer.forecast.io

(function() {

  "use strict";

  var usage = function() {
    console.error("usage: wea <zipcode>");
    process.exit(1);
  };

  var
    Bluebird = require("bluebird"),
    Weather = require("weather-zip"),
    FS = Bluebird.promisifyAll(require("fs"))
    ;

  if (process.env.DARK_CMD === undefined) {
    console.error("$DARK_CMD path not set.");
    process.exit(1);
  }

  var
    argv,
    zip
    ;

  argv = process.argv;
  if (argv.length != 3) {
    usage();
  }

  zip = argv[2];

  var promise = FS.readFileAsync(process.env.DARK_CMD + "/etc/keys/forecast.io.txt").then(function(data) {
    return data.toString().trim();
  })

  .error(function(err) {
    console.error("API key not found.");
    process.exit(1);
  });

  promise.then(function(forecastio_key) {

    var weather = new Weather(forecastio_key);

    weather.get(zip)
    .then(function (data){

      if (data === undefined) {
        console.log('no data found.');
        return;
      }

      data.currently = data.currently === undefined ? "empty" : data.currently;
      data.minutely = data.minutely === undefined ? "empty" : data.minutely;
      data.hourly = data.hourly === undefined ? "empty" : data.hourly;
      data.daily = data.daily === undefined ? "empty" : data.daily;

      // ugly.. we might need different printers, for example: irc, cli
      // this goes for all darkness commands..
      // this is condensed, abbreviated one line output is suitable for irc
      console.log(
        "(" +
          "currently: " + data.currently.summary + ", " +
          "precipitation: " + (data.currently.precipProbability * 100) + "%, " +
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

  });


}) ();
