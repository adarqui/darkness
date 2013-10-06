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
            irc : {},
		},
	}
}
