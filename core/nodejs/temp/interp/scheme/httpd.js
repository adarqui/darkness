var initExpress = function() {

  /*
   * Initialize express routes/middleware
   */
  c.http.app = d.express();

/*
  c.http.app.use(d.express.logger());
  c.http.app.use(d.express.cookieParser());
  c.http.app.use(d.express.bodyParser());
  c.http.app.use(d.express.favicon());
  c.http.app.use(d.express.session({ secret: "secret" }));
*/

  if(c.http.basicAuth == true) {
    c.http.app.use(d.express.basicAuth('root', 'pa11word'));
  }

  c.http.app.use(middleware.fixBody);
  c.http.app.use(middleware.auth);
  c.http.app.use('/static',d.express.static(c.http.options.pub));

  c.http.server = d.http.createServer(c.http.app).listen(c.http.port);
  c.http.io = d.io.listen(c.http.server);

  c.http.app.get('/pipelines/all', handle.pipelines.all);
  c.http.app.get('*', handle.index);

}



var initIO = function() {

  /*
   * Initialize socket.io - this will come in handy later
   */
  c.http.io.on('connection', function(socket) {
    socket.on('join', function(data) {
/*
if(typeof data.room !== 'string') {
  return;
}

socket.join(data.room)
*/
    });

      socket.on('leave', function(data) {
/*
if(typeof data.room != 'string') {
  return;
}
socket.leave(data.room)
*/
    });
  });
}



var initHandle = function() {
  handle = {
    index : index,
    pipelines : pipelines
  }
}



/*-----------------------------------------------------------------------------------------------
 * Middleware *
 *----------------------------------------------------------------------------------------------*/

var middleware = {
  /* This centralizes request parameters */
  fixBody : function(req,res,next) {
    req.request = undefined;
    if(d._.size(req.body) > 0) { req.request = req.body; }
    else if (d._.size(req.query) > 0) { req.request = req.query; }
    else if(d._.size(req.params) > 0) { req.request = req.params; }

    if(req.request == undefined) { req.request = {}; }
    next();
  },
  auth: function(req,res,next) {
    return next();
  }
}



var index = function(req,res,next) {
  return res.sendfile(__dirname+'/pub/'+'index.html');
}
