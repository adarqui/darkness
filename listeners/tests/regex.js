var input = process.argv[2]

console.log("input", input)

//var re = /(\w+):(\w+):(.*)/.exec(input)
var re = /(.*):(.*):(.*)/.exec(input)

console.log(re)
