var fs = require('fs');
var needle = require('needle');
var path = require('path');
var Artifacts = require('./artifacts.js');
var WS = require('./ws.js');

var Composite = function (name, file) {     
    var filePath = file ? file : './composite.json';
    var self = this;
    
    this.services = {};
    this.artifacts = {};
    this.validation = {};
    this.artifacts = new Artifacts(filePath);
    
    this.ws = new WS({port : this.artifacts.data.port});
        
    /* API to sync artifacts */
    this.ws.route({
        method : 'post',
        path : '/sync-artifacts',
        handler : function (request, reply) {
            reply({message : 'ok'});
            self.applyArtifacts(request.body.artifacts);
            self.syncArtifacts();
        } 
    });
    
    this.applyArtifacts();
}


Composite.prototype.syncArtifacts = function () {
    this.artifacts.save();
    var components = this.artifacts.data.components;
    for (var i in components) {
        if (!components[i].isComposite) {
            var url = components[i].host + ':' + components[i].port + '/sync-artifacts';
            needle.post(url, {artifacts : this.artifacts.data});
        }
    }
}

Composite.prototype.applyArtifacts = function (artifacts) {
    self = this;
    if (artifacts) {
        this.artifacts.data = artifacts;
        this.artifacts.save();
    }
    
    var composite = this.artifacts.data;
    var paths = ['/sync-artifacts'];
          
    /* Open a web API for each service */
    for (var serviceName in composite.services) {
        var service = composite.services[serviceName];
        bindComponent = composite.components[service.bind.component];
        urlBind(bindComponent, service);
        paths.push(service.path);
    }
    
    this.ws.cleanUnusedRoutes(paths);
}

var urlBind = function(bindComponent, service) {
    self.ws.route({
        method : service.method,
        path : service.path,
        handler : function (request, reply) {                
            var url = bindComponent.host + ':' + bindComponent.port + bindComponent.services[service.bind.service].path;
            var method = bindComponent.services[service.bind.service].method;
            for (var paramName in request.params) {
                if (url.indexOf(':' + paramName) > -1) {
                    url = url.replace(':' + paramName, request.params[paramName]);
                } else {
                    if (request.body == null) request.body = {};
                    request.body[paramName] = request.params[paramName];
                }
            }
            
            if (method == 'get') {
                needle.get(url, {timeout : 0, json : true}, function (error, data) {
                    if (error) {
                        console.log('Some error occured with '+url);
                        console.log(error);
                    }
                    if (data) reply(data.body);
                });
            } else if (method == 'post') {
                needle.post(url, request.body, { timeout : 0, json : true}, function (error, data) {
                    if (error) {
                        console.log('Some error occured with '+url);
                        console.log(error);
                    }
                    if (data) reply(data.body);
                });
            } 
        }
    });
}

module.exports = Composite;
