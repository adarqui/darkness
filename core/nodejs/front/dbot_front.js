var strings;
var d;
var c;



var initStrings = function() {
  return {
    config : 'config.json',
  };
}



var initDeps = function() {
  return {
    irc    : require('irc'),
    net    : require('net'),
    rands  : require('randstring'),
    config : require(strings.config)
  };
}



var initConf = function() {
  return d.config;
}



var initEnv = function() {
  var conf = process.env['CONFIG']
  if(conf != undefined) { strings.config = conf; }
}



var initId = function() {
  c.author.id = d.rands(5);
}



var parseMessage = function(message) {
/*
{"prefix":"root!root@127.0.0.1","nick":"root","user":"root","host":"127.0.0.1","command":"PRIVMSG","rawCommand":"PRIVMSG","commandType":"normal","args":["#darqbot","^(caps (e yo))"],"server":{"name":"localhost","address":"localhost","port":6667},"author":{"name":"front","id":"ng6r6"},"type":"raw","result":"YO"}
*/
  try {

    message = JSON.parse(message);

    var server = c.servers[message.server.name];
    server.irc.say(message.args[0], message.result);

  } catch(err) {
    console.log('parseMessage', err);
  }

}


var bindNet = function() {
  c.net.chan = d.net.createServer(function(x) {

    console.log("connected");

    try {
      c.net.sockets[x._handle.fd] = x;
    } catch(err) {
      console.log("bindNet: err", err);
    }

    x.on('end', function() {
      console.log("disconnected");
      try {
        c.net.sockets[x._handle.fd] = {};
      } catch(err) {
        console.log("err", err);
      }
    });

    x.on('data', function(data) {
      data = data.toString();
      console.log("data", data);
      parseMessage(data);
    });
  });

  c.net.chan.listen(c.net.port, c.net.host, function() {
    console.log("bind");
  });
}





var sendAll = function(type,message) {

  message.author = c.author;
  message.type = type;

  for(var v in c.net.sockets) {
    var socket = c.net.sockets[v];
    try {
      socket.write(JSON.stringify(message));
    } catch(err) {
      c.net.sockets[v] = {};
    }
  }
}



var appendMessage = function(message,server) {
  message.server = {
    author : server.author,
    name : server.name,
    address : server.address,
    port : server.port,
  };
}




var connectIrc = function() {

  for(var v in c.servers) {
    var server = c.servers[v];

    server.irc = {};

    server.irc = new d.irc.Client(
      server.address,
      server.nick,
      server
    );

    server.name = v;

    server.irc.addListener('raw', (function(__server) {
      return function(message) {
        appendMessage(message,__server);
        sendAll('raw',message);
      }
    })(server));

    server.irc.addListener('error', (function(__server) {
      return function(message) {
        console.log("error", message);
        appendMessage(message,__server);
        sendAll('error',message);
      }
    })(server));
  }
}



var init = function() {

  strings = initStrings();
  initEnv();
  d = initDeps();
  c = initConf();
  c.net.sockets = [];
  initId();

  connectIrc();
  bindNet();

}


init();
