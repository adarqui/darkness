module.exports = {
        author : {
            name : 'front',
            id : {},
        },
        net : {
            port : 7654,
            host : '127.0.0.1',
            chan : {},
            sockets : {},
        },
		servers : {
        'mzima' : {
            address : 'irc.mzima.net',
			port : 6667,
            nick : 'ref',
            channels : [ '#jumping' , '#darqbot' ],
            userName : 'ref',
            realName : 'ref',
            debug : true,
            showErrors : 'true',
            messageSplit : 1024,
        },
        'freenode' : {
            address : 'irc.freenode.net',
			port : 6667,
            nick : 'dref',
            channels : [ '#adarq.org' ],
            userName : 'dref',
            realName : 'dref',
            debug : false,
            showErrors : false,
            messageSplit : 512,
        },
		'localhost' : {
            address : 'localhost',
			port : 6667,
            nick : 'lref',
            channels : [ '#darqbot' ],
            userName : 'lref',
            realName : 'lref',
            debug : false,
            showErrors : false,
            messageSplit : 512,
		},
		}
}
