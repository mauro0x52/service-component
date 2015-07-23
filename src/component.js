var fs = require('fs');
var needle = require('needle');
var path = require('path');
var WS = require('./ws.js');
var Artifacts = require('./artifacts.js');

var Component = function (name, file) {
    if (!name) throw { name : 'ComponentNameNotProvided', message : 'component name not provided' };
    var filePath = file ? file : './../composite.json';
    
    var self = this;
    
    this.services = this.services || {};
    this.artifacts = {};
    this.validation = {};
    this.consume = {};
    this.artifacts = new Artifacts(filePath);
    this.composite = this.artifacts.data;
    this.name = name;
    
    var component = this.artifacts.getComponent(this.name);
    
    this.ws = new WS({port : component.port});
    
    /* API to sync artifacts */
    this.ws.route({
        method : 'post',
        path : '/sync-artifacts',
        handler : function (request, reply) {
            reply({message : 'ok'});
            self.applyArtifacts(request.body.artifacts);
        } 
    });
    
    setTimeout(function () { self.applyArtifacts() }, 1);
}

Component.prototype.syncArtifacts = function () {
    this.artifacts.save();
    var url = this.composite.host + ':' + this.composite.port + '/sync-artifacts';
    needle.post(url, { artifacts : this.artifacts.data }, function (error, data) {
        if (error) {
            console.log('Error when syncing artifacts');
            console.log(error);
        }
    });
}

Component.prototype.applyArtifacts = function (artifacts) {
    var self = this;
    if (artifacts) {
        this.artifacts.data = artifacts;
        this.artifacts.save();
    }
        
    var component = this.artifacts.getComponent(this.name);
    var paths = ['/sync-artifacts'];
                        
    /* Open a web API for each service */
    for (var serviceName in component.services) {
        var service = component.services[serviceName];
        serve(self.ws, service, self.services[serviceName]);
        paths.push(service.url);
    }
    
    this.ws.cleanUnusedRoutes(paths);
    
        
    /* Bind the reference to a specific service */
    for (var bindings in component.bind) {
        var bind = component.bind[bindings];
        var serviceComponent = self.artifacts.getComponent(bind.component);
        var service = serviceComponent.services[bind.service];
        self.consume[bindings] = bindConsumer(serviceComponent, service);
    }
}

var serve = function(ws, service, serviceFunction) {
    ws.route({
        method : service.method,
        path : service.path,
        handler : serviceFunction 
    });
}

var bindConsumer = function (serviceComponent, service) {
    return function () {
        var urlParams = null;
        var postData = {};
        var instance = null;
        var shift = 0;
        var cb = null;
        
        if (serviceComponent.multipleInstances) {
            instance = {
                host : serviceComponent.instances[arguments[0]].host,
                port : serviceComponent.instances[arguments[0]].port
            };
            shift = 1;
        }
        
        if (typeof arguments[shift] == 'function') {
            cb = arguments[shift];
        } else if (typeof arguments[shift+1] == 'function') {
            urlParams = arguments[shift];
            cb = arguments[shift+1];
        }
        else {
            urlParams = arguments[shift];
            postData = arguments[shift+1];
            cb = arguments[shift+2];
        }        
                        
        if (instance) {
            var url = instance.host + ':' + instance.port + service.path;
        } else {
            var url = serviceComponent.host + ':' + serviceComponent.port + service.path;
        }
        
        for (var paramName in urlParams) {
            url = url.replace(':' + paramName, urlParams[paramName]);
        }
        
        var missingArguments = url.replace(/http\:\/\/[^\/]*/,'').match(/\:[^/]*/gi);
        if (missingArguments) {
            console.log('Missing arguments');
            console.log({ name : 'MissingArguments', message : 'argument ' +  missingArguments[0] + ' is missing' });
        }
        
        if (service.method == 'get') {
            needle.get(url, { timeout : 0, json : true}, function (error, data) {
                if (cb && data) cb(data.body);
                if (error) {
                    console.log('Some error occured with '+url);
                    console.log(error);
                }
            });
        } else if (service.method == 'post') {
            needle.post(url, postData, { timeout : 0, json : true}, function (error, data) {
                if (cb && data) cb(data.body);
                if (error) {
                    console.log('Some error occured with '+url);
                    console.log(error);
                }
            });
        } 
    }
}

module.exports = Component;
