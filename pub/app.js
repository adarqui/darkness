$(document).ready(function() {

	var app = app || {}
	window.app = app

        app.io = io.connect('/')
        app.io.on('connect', function(data) {
//                app.ev.trigger('sockio:connected')
        })

	app.view = {
		cv : null,
		name : "",
		removeHook : null,
		setCv : function(el,view) {
			app.view.cv = el
			app.view.name = view
		},
        	/* Current View manager */
        	removeOne: function(cv) {
    	        if(app.view.cv != null) {

                               if(typeof(app.view.removeHook) === 'function') {
                                        app.view.removeHook()
                                }

                	$(app.view.cv).remove()
            	}
        	},
        	remove: function() {
            	if(typeof app.view.cv === 'array') {
                	for(var v in app.view.cv) {
                    		app.view.removeOne(app.view.cv[v])
                	}
            	} else {
                	app.view.removeOne(app.view.cv)
            	}
            	app.view.cv = null
		app.view.removeHook = null
        	},
	}


	var bootstrap = function() {
		runApp()
	}


var runApp = function() {


	var bootstrap = function() {
	}




	var Keys = {
		ajax : {
			get : function(cb) {
				$.get('/api/keys', cb)
			},
		},
		view : {
		},
	}
	

	Router = Backbone.Router.extend({
		routes : {
			'' : 'home',
			'loc' : 'home',
			"loc/home" : 'home',
			'loc/pipelines' : 'pipelines',
			'loc/help' : 'help',
			'loc/monitor' : 'monitor',
		},
		initialize : function() {
		},
		home : function() {
			app.view.remove()
		},
		pipelines : function() {
			app.view.remove()
			var v = routers.pipelines()
			app.view.setCv(v,'pipelines')
		},
		monitor : function(e) {
			app.view.remove()
			var v = routers.monitor(e)
			app.view.setCv(v,'monitor')
		},
	})



	var routers = {}

	routers.monitor_redis = function(data) {
		console.log("MONITOR", data)
		if(app.view.name == 'monitor') {
			console.log(data)

			$('.monitor', app.view.cv).prepend('<pre class="prettyprint lang-js">'+JSON.stringify(data,null,' ')+'</pre>')
		}
	}

	routers.monitor = function() {
		var el = document.createElement('div')
		$('.app').append(el)
		$(el).html(_.template($('script[rel="monitor-VC"]').html()))


		app.io.on('redis_activity', routers.monitor_redis)
		app.io.emit('join', { room : 'redis' })

		app.view.removeHook = function() {
			app.io.removeListener(routers.montior_redis)
			app.io.emit('leave', { room : 'redis' })
		}

		return el
	}


	routers.pipelines = function() {
		var el = document.createElement('div')
		$('.app').append(el)
		$(el).html(_.template($('script[rel="pipelines-VC"]').html()))
		$.ajax({
			url : '/pipelines/all',
			success : function(data) {
				var sv = []
				for(var v in data) {
					var datum = data[v]

					var tpl = _.template($('script[rel="pipelines-V"]').html())

//					sv.push(tpl(datum))	

var tpl_data = tpl(datum)
//var sub_el = document.createElement('li')
var sub_el = document.createElement('div')
console.log(sub_el)
sv.push(sub_el)

/*
        var node = new PrettyJSON.view.Node({
            el:$('.key_contents',sub_el),
            data:datum
        });
console.log(node,datum)
*/

//$('.keyContents',sub_el).text('hihihi')

$(sub_el).html(tpl_data)

        var node = new PrettyJSON.view.Node({
            el:$('.keyContents', sub_el),
            data:datum
        });
//node.expandAll()
node.collapseAll()
console.log(node,datum)

$('.pipelines', el).prepend(sub_el)

				}
//				$('.pipelines', el).prepend(sv)
			},
			error : function(data) {
			},
		})
		return el
	}


	routers.workers = function() {
		var el = document.createElement('div')
		$('.app').append(el)
		$(el).html(_.template($('script[rel="workers-VC"]').html()))
		$.ajax({
			url : '/api/workers/list',
			success : function(data) {
				var sv = []
				for(var v in data.obj) {
					var datum = data.obj[v]
					var tpl = _.template($('script[rel="workers-V"]').html())

console.log("datum", datum)
					sv.push(tpl( { worker : datum }))
				}
				$('.workers', el).append(sv)
			},
			error : function(data) {
			}
		})
		return el
	}

	routers.queue = function(key) {
		var sv = []
		var el = document.createElement('div')
		$('.app').append(el)
		$(el).html(_.template($('script[rel="queue-VC"]').html())),
		app.view.key = key

		if(key.indexOf('video') >= 0) {
			app.view.tpl = _.template($('script[rel="vid-view"]').html())
		} else if(key.indexOf('image') >= 0) {
			app.view.tpl = _.template($('script[rel="img-view"]').html())
		} else {
			app.view.tpl = _.template($('script[rel="other-view"]').html())
		}

		if(key.indexOf('flagged') < 0) {
			app.view.flag = "FLAG"
		} else {
			app.view.flag = "UNFLAG"
		}

		return el
	}


	app.Router = new Router()


	$('body').delegate('.key', 'click', function(e) {
	})


	$('body').delegate('.nav', 'click', function(e) {
		/* Hook all links, navigate */
		e.preventDefault()
		var lc = e.target.pathname.toLowerCase()
		if(e.target.href.indexOf('javascript') >= 0) return false
		app.Router.navigate(lc, {trigger: true})
		return false
	})


	$('body').delegate('.refresh', 'click', function(e) {
		var frag = Backbone.history.fragment
		Backbone.history.fragment = null
		app.Router.navigate(frag, {trigger: true})	
	})



    Backbone.history.start({pushState:true})



	app.ev = _.extend({}, Backbone.Events)
	app.ev.on('all', function(channel) {
/*		noty({ text: channel, type: 'error'}) */
	})
	app.ev.on('sockio:connected', function() {
/*		noty({ text: 'socket.io connected', type : 'error' }) */
	})


	bootstrap()

// end runApp()
}



bootstrap()

})
