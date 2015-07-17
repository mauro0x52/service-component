var SCA = require('./../../../sca.js');
var Translator = new SCA.Component('Translator');

Translator.services.translate = function (request, reply) {
    var text = 'Hello';
    switch (request.params.language) {
        case 'en' : text = 'Hello'; break;
        case 'pt' : text = 'Olá'; break;
        case 'jp' : text = 'もしもし'; break;
        case 'es' : text = '¡Hola'; break;
        default : text = 'Hello';
    }
    reply({text : text});
}
