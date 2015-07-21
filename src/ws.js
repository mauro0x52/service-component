var express = require('express');
var bodyParser = require('body-parser');

var WS = function (params) {
    var self = this;
    this.express = new express();
    
    var setHeaders = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
        res.contentType('json');
        next();
    };
    
    this.express.use(setHeaders);
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({extended : true}));
    
    this.routes = {};

    this.express.listen(params.port || 80);
}

WS.prototype.route = function (params) {
    this.removeRoute(params.path);
    this.routes[params.path] = { path : params.path, method : params.method };
    this.express[params.method](params.path, function (request, response) {    
        params.handler(request, function (data) { response.send(data) });
    });
}

WS.prototype.removeRoute = function (removePath) {
    if (this.routes.hasOwnProperty(removePath)) {
        var routes = this.express._router.stack;
        for (var i in routes) {
            var route = routes[i];
            if (route.route) {
                var path = route.route.path;
                if (path == removePath) {
                    routes.splice(i, 1);
                } 
            }
        }
    }
    delete this.routes[removePath];
}

WS.prototype.cleanUnusedRoutes = function (paths) {
    for (var i in paths) {
        if (this.routes.hasOwnProperty(paths[i]) == false) this.removeRoute(paths[i]);
    }
}

module.exports = WS;
