var pipelines = {
  all : function(req,res,next) {
    var array = {};
    var _pipelines = d._.clone(c.pipelines);
    for(var v in _pipelines) {
      var _pipeline = _pipelines[v];
      delete _pipeline.special;
      array[_pipeline.index] = _pipeline;
    }
    res.json(array);
  }
}



var Pipeline = function(opts) {
  var self = this;

  self.id = {};
  self.channel = "dbot:unowned";
  self.expressions = [];
  self.expressions_length = 0;
  self.evaluated = {};
  self.evaluated_length = 0;
  self.js = opts.js;

  self.node = {
    tunnel : c.author.name,
    listener : "any"
  };

  self.chat = {
    from : "from",
    to : "to",
    message : "message",
  };

  self.init = function(o) {
    self.setId();
    self.setExpressions(o);
    self.expressions_length = self.getExpressionsLength();

    self.setChat(o);
    self.setChannel(o.channel);

    self.indexInc();
  }

  self.indexInc = function() {
    c.index+=1;
  };

  self.getExpressionsLength = function() {
    return self.expressions.length;
  };

  self.setChat = function(o) {
    self.chat.from = o.chat.from;
    self.chat.to = o.chat.to;
    self.chat.message = o.chat.message;
  };

  self.setNode = function(o) {
    self.node.tunnel = o.node.tunnel;
    self.node.listener = o.node.listener;
    self.node.message = o.node.message;
  };

  self.setId = function() {
    self.id = Math.random();
    return self.id;
  };

  self.getId = function() {
    return self.id;
  };

  self.setChannel = function(channel) {
    if(channel != undefined) {
      self.channel = channel;
    }
  };

  self.getChannel = function() {
    return self.channel;
  };

  self.setExpressions = function(o) {
    self.expressions = o.expressions;
  };

  self.getExpressions = function() {
    return self.expressions;
  };

  self.setResponse = function(response) {

    response.ts.response = (new Date()).valueOf();

    var element = self.evaluated[response.id.expression];
    if(element == undefined) {
      self.evaluated[response.id.expression] = response;
      self.evaluated[response.id.expression].responses = [];
      return true;
    } else {
      element.responses.push(response);
      return false;
    }
  };



  /*
   * Special bot commands
   */
  self.specialFill = function() {
  };

  self.special = {
    'times' : {
      help : 'returns the times (user and system space) a set of expression(s) took',
      do : function(element) {

      console.log(JSON.stringify(self.evaluated,null,4));

      var opts = {
        time : {
          utime : 0,
          stime : 0,
          stack : [],
        }
      };

      self.fillExpression(element, opts);

      var new_args = [];

      new_args.push('e');
      new_args.push(opts.time.utime);
      new_args.push(opts.time.stime);
      new_args.push(JSON.stringify(opts.time.stack));
      element.args = new_args;

      return { type : 'run' };
    }
  },
  'time' : {
    help : 'returns the times (user and system space) a set of expression(s) took',
    do : function(element) {
      var ret = self.special.times.do(element);
      element.args.splice(3,1);
      return ret;
    },
  },
  'utime' : {
    help : 'returns the userspace time a set of expression(s) took',
    do : function(element) {
      var ret = self.special.times.do(element);
      element.args.splice(2,2);
      return ret;
    },
  },
  'stime' : {
    help : 'returns the system space time a set of expression(s) took',
    do : function(element) {
      var ret = self.special.times.do(element);
      element.args.splice(1,1);
      element.args.splice(2,1);
      return ret;
    }
  },
  'who' : {
    help : 'returns the listener node which evaluated the expression',
    do : function(element) {

      self.fillExpression(element, opts);

      var new_args = [ 'e', opts.who ];
      for(var v = 1 ; v < element.args.length ; v++) {
        new_args.push(element.args[v]);
      }
      element.args = new_args;
      return { type : 'run' };
    },
  },
  'whoami' : {
    help : 'returns the user who executed the command',
    do : function(element) {
      element.args = [ 'e' , self.js.nick ];
      return { type : 'run' };
    },
  },
  'irc:get:target' : {
    help : 'gets the target that shit message should go to',
    do : function(element) {
      element.args = [ 'e', self.js.args[0] ];
      return { type : 'run' };
    }
  },
  'irc:set:target' : {
    help : 'sets the privmsg target',
    do : function(element) {

      self.fillExpression(element);
      self.js.args[0] = element.args[1];
      element.args[0] = 'nop';
      return { type : 'run' };
    },
  },
  'irc:get:nick' : {
    help : 'gets the current nickname',
    do : function(element) {
      element.args = [ 'e', 'poop' ];
      return { type : 'run' };
    },
  },
  'irc:set:nick' : {
    help : 'changes the bot nickname',
    do : function(element) {
      return { type : 'skip' };
    }
  },
  'irc:get:server' : {
    help : 'get the current irc servers',
    do : function(element) {
      element.args = ['e', self.js.server.address];
      return { type : 'run' };
    },
  },
  'irc:get:servers' : {
    help : 'get the current configured list of servers',
    do : function(element) {
      return { type : 'skip' };
    },
  },
  'irc:set:server' : {
    help : 'set the irc server that this message gets sent to',
    do : function(element) {
      self.fillExpression(element);
      self.js.server.name = element.args[1];
      element.args[0] = 'nop';
      return { type : 'run' };
    }
  },
}

  self.parseSpecial = function(element) {
    try {
      var special_cmd = self.special[element.args[0]];
      var res = special_cmd.do(element);

      switch(res.type) {
        case 'skip' : {
          self.expressions.splice(0,1);
          self.evaluated_length += 1;
          return true;
        }
        case 'run' : {
          return false;
        }
        default : {
          return false;
        }
      }
    } catch(err) {
      return false;
    }
  }



  self.evaluate = function() {

    /* are we done */
    var difference = self.expressions_length - self.evaluated_length;

    if(difference == 1 && self.evaluated_length != 0) return 1;

    /* publishes the 'deepest' expression */
    var element = self.expressions[0];

    var truth = self.parseSpecial(element);
    if(truth == true) { return self.evaluate(); }

    var sub_channel = self.createSubChannel(element.id);

    self.expressions.splice(0,1);

    var created_message = self.createMessage(sub_channel, element);
    var created_channel = self.getChannel();

    c.redis.pub.publish(created_channel, created_message);

    self.evaluated_length += 1;

    return difference;
  }



  self.createMessage = function(sub_channel, expression) {

    self.fillExpression(expression);
    var message = sub_channel + ':' + JSON.stringify(expression.args);
    return message;
  }



  self.createSubChannel= function(expression_id) {

/*

stimuli:
    <pipeline>:<expression>:<type>:<options>:<ts-u-cmd-diff>:<ts-s-cmd-diff>:<tunnel>:<listener>:<from>:<to>:<STIMULI:JSON>
response:
    <pipeline>:<expression>:<type>:<options>:<ts-u-cmd-diff>:<ts-s-cmd-diff>:<tunnel>:<listener>:<from>:<to>:<RESPONSE:STRING>

*/

    var bundle = {
      id : {
        pipeline : self.id,
        expression : expression_id,
      },
      type : "eval",
      opts : "null",
      ts : {
        command : {
          user : "0",
          system : "0",
        },
      },
      node : {
        tunnel : self.node.tunnel,
        listener : self.node.listener,
      },
      chat : {
        from : self.chat.from,
        to : self.chat.to,
      },
    };


    return bundle.id.pipeline+":"+bundle.id.expression+":eval:null:0:0:"+bundle.node.tunnel+":"+bundle.node.listener+":"+bundle.chat.from+":"+bundle.chat.to;

  }



  self.fillExpression = function(expression, opts) {

    if (opts == undefined) opts = {}

        for(var v in expression.args) {
            var arg = expression.args[v]
            if(typeof arg === 'object') {
                var response = self.evaluated[arg.id]
                if(response != undefined) {
                    expression.args[v] = response.chat.message


if(opts.time != undefined) {
	var user = parseInt(response.ts.command.user,10)
	var sys = parseInt(response.ts.command.system,10)

	opts.time.utime += user
	opts.time.stime += sys

	opts.time.stack.push([user,sys])

console.log("opts.time", opts.time)
}

opts.who = response.node.listener

                } else {
                    expression.args[v] = ''
                }

            }
        }

	}


  self.finalEvaluation = function() {

    for(var v in self.expressions) {
      var expression = self.expressions[v];
      self.fillExpression(expression);
    }

    self.js.result = self.expressions[0].args.join(' ');
    return self.js;
  }



  self.destroy = function() {
    c.pipelines[self.id] = {};
    delete c.pipelines[self.id];
  }



  return self.init(opts);
}
