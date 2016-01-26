// (+ 1 (- 2 (/ 3 (* 4 9)))) (+ 2 2)
// (+ 1 (- 2 (/ 3 (* 4 9)) (+ 55 77) (+ 66 (/ 88 99)))) (+ 2 2)


var repl = require("repl")


var tokenize = function(input) {
    var ret = input.split('"')
                .map(function(x, i) {
                   if (i % 2 === 0) { // not in string
                     return x.replace(/\(/g, ' ( ')
                             .replace(/\)/g, ' ) ');
                   } else { // in string
                     return x.replace(/ /g, "!whitespace!");
                   }
                 })
                .join('"')
                .trim()
                .split(/\s+/)
                .map(function(x) {
                  return x.replace(/!whitespace!/g, " ");
                });

    return ret
  }



var circularJSON = function(obj) {
var cache = [];
var val = JSON.stringify(obj, function(key, value) {
    if (typeof value === 'object' && value !== null) {
        if (cache.indexOf(value) !== -1) {
            // Circular reference found, discard key
            return;
        }
        // Store value in our collection
        cache.push(value);
    }
    return value;
}, 4);
cache = null; // Enable garbage collection
return val
}




var traverse = function(context, cb, output) {
	for(var v in context.next) {
		traverse(context.next[v], cb, output)	
	}
//	console.log("evaluating:", context.args)
	cb(context)

	output.push({id:context.id, args:context.args})
}



var Context = function(opts) {
	var self = this

	self.prev = {}
	self.next = []
	self.args = []

	self.id = {}

	self.init = function(opts) {
		self.prev = opts.prev

		self.id = self.setId()
	}
	self.addArg = function(arg) {
		self.args.push(arg)
	}
	self.addContext = function(arg) {
		self.next.push(arg)
	}
	self.getId = function() {
		return self.id
	}
	self.setId = function() {
		var id = Math.random()
		self.id = id
		return id
	}
	self.init(opts)
}




var chain = function(tokens, statements) {

	var new_statements = statements

//console.log("burp:"+tokens[0])

	if (tokens == undefined) {
//console.log("f")
		return statements
	} else if (tokens[0] == undefined) {
//console.log("a")
		return statements
	} else if(tokens[0] == '(') {

//statements.args.push('_')

new_statements = new Context({prev:statements})

var id = new_statements.getId()
statements.args.push({ id: id })

		statements.addContext(new_statements)

		//console.log("[")
	} else if(tokens[0] == ')') {
		//console.log("]")

//console.log("die")

//console.log("tokens[1]", tokens[1])

new_statements = statements.prev

//		return statements
	} else {
		//console.log(tokens[0])
//		statements.push(tokens[0])
		statements.addArg(tokens[0])
		new_statements = statements
	}

	//statements.push(new_statements)
//console.log("fuck")
	var ret =  chain(tokens.splice(1,tokens.length), new_statements)
//console.log("omg")
	return ret
}




var parse = function(cmd) {
	//console.log(cmd)
	var tokenized = tokenize(cmd)
	//console.log(tokenized)	

	var statements = new Context({prev:{}})

	chain(tokenized,statements)

	//console.log(circularJSON(statements))

	traverse(statements, function(ctx) {
		//console.log("ctx args:", ctx.args)
	})

}





var tokenize = function(input) {
    var ret = input.split('"')
                .map(function(x, i) {
                   if (i % 2 === 0) { // not in string
                     return x.replace(/\(/g, ' ( ')
                             .replace(/\)/g, ' ) ');
                   } else { // in string
                     return x.replace(/ /g, "!whitespace!");
                   }
                 })
                .join('"')
                .trim()
                .split(/\s+/)
                .map(function(x) {
                  return x.replace(/!whitespace!/g, " ");
                });

    return ret
  }






var _parse = function(cmd, cb) {

    var tokenized = tokenize(cmd)
    //console.log(tokenized)

    var statements = new Context({prev:{}})

//  statements = chain(tokenized, statements)
    chain(tokenized,statements)

//  console.log(JSON.stringify(statements,null,4))

    //console.log(circularJSON(statements))

	var output = []

    traverse(statements, function(ctx) {
        //console.log("ctx args:", ctx.args)
    }, output)

	if(typeof cb === 'function') {
		cb(output)
	}
}





/*
repl.start({
  prompt: "> ",
  eval: function(cmd, context, filename, callback) {
   
    if (cmd !== "(\n)") {
      cmd = cmd.slice(1, -2); // rm parens and newline added by repl
//      var ret = littleLisp.interpret(littleLisp.parse(cmd));
    
      var ret = parse(cmd)
   
      callback(null, ret);
    } else {
      callback(null);
    }
  }
})
*/

module.exports = function(opts) {

	var self = this
	self.init = function(o) {
	}

	self.parse = _parse

	return self.init(opts)
}
