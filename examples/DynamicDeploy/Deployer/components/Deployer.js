var SCA = require('./../../../../service-component.js');
var Deployer = new SCA.Component('Deployer');
var fork = require('child_process').fork;
var fs = require('fs');

Deployer.services.ping = function (request, reply) {
    Deployer.consume.ping(request.params.port, function (data) {
       reply(data); 
    });
}

Deployer.services.deploy = function (request, reply) {
    var self = this;
    var port = request.params.port
    var filePath = './../../ToDeploy/composites/composite'+port+'.json';
        
    var artifacts = {
        name : "Deployer",
        host : "http://localhost",
        port : port,
        services : {
            deploy : {
                method    : "get",
                path      : "/ping",
                bind      : {
                    component : "Pinger",
                    service   : "ping"
                }
            }
        },
        components : {
            Pinger : {
                host : "http://localhost",
                port : parseInt(port) + 1000,
                services : {
                    ping : {
                        method : "get",
                        path   : "/ping"
                    }
                }
            }
        }
    };
        
    fs.writeFileSync(filePath, JSON.stringify(artifacts, null, 4));
        
	fork('./../../ToDeploy/ToDeploy.js', [port]);
	fork('./../../ToDeploy/components/Pinger.js', [port]);
    
	setTimeout(function () {
        Deployer.artifacts.data.components.MultiDeploy.instances[port] = {
            "host" : "http://localhost",
            "port" : port
        }
        Deployer.syncArtifacts();
        reply({message : 'Deployed new instance on port: '+port});
    }, 1000);
}
