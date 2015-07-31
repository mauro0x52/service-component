var SCA = require('./../../../../service-component.js');
var Pinger = new SCA.Component('Pinger', './../../ToDeploy/composites/composite'+process.argv[2]+'.json');

Pinger.services.ping = function (request, reply) {
    reply({message : 'pong'});
}
