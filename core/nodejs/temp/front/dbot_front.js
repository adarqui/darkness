#!/usr/bin/env node

var
  net = require('net'),
  uuid = require('uuid'),
  darkness_redis = require('../lib/redis'),
  darkness_config = require('../lib/config'),
  darkness_events = require('../lib/events')
  ;



var usage = function() {
  console.log('usage: ./front <path/to/config.json>');
  process.exit(1);
}



var main = function() {
  if (process.argv.length < 2) {
    usage();
  }

  var front = new Front();
  front.setConfig(process.argv[2]);
  front.run();
}



var Front = function() {

  var self = this;

  this.config = null;
  this.uuid = uuid.v4();

  this.setConfig = function(config) {
    this.config = require(config);
  }

  this.connectIrc = function() {
    var server = this.config.servers['localhost']; // fix
    var client = new net.Socket();
    client.connect(server.port, server.address, function() {
      console.log('irc: connected');
    });
    client.on('data', function(data) {
      console.log('data');
    });
    client.on('close', function() {
      console.log('close');
      self.connectIrc();
    });
    client.on('error', function(err) {
      console.log(err);
    });
  }

  this.connectRedis = function() {
    var server = this.config.redis;
    var client = new net.Socket();
    client.connect(server.port, server.host, function() {
      console.log('redis: connected');
    });
    client.on('data', function(data) {
      console.log('data');
    });
    client.on('close', function() {
      console.log('close');
      self.connectRedis();
    });
    client.on('error', function(err) {
      console.log(err);
    });
  }

  this.run = function() {
    if (this.config == null) {
      throw('set config');
    }
    this.connectIrc();
    this.connectRedis();
  }

  return this;
}



main();
