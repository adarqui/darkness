module.exports = {
    author : {
        name : 'master',
        id : {}
    },
    redis : {
        pub : {},
        sub : {},

        host : '127.0.0.1',
        port : 6379

    },
    net : {
        chan : {},
        host : '127.0.0.1',
        port : 7654
    },
	http : {
		app : {},
		io : {},
		port : 5000,
		server : {},
		options : {
			basicAuth : false,
			pub : __dirname + '/../../pub/',
		}
	},
    pipelines : {},
	index : 0,
}
