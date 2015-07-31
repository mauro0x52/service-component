var SCA = require('./../../../service-component.js');
var Writer = new SCA.Component('Writer');

Writer.services.write = function (request, reply) {
    Writer.consume.translate({ language : request.params.language }, function (data) {
        reply({ text : data.text + ' '+request.params.name+'!' });
    });
}
