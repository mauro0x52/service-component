var SCA = require('./../../../service-component.js');
var fs = require('fs');

var file = fs.readFileSync('./composite.json.orig', 'utf8');
fs.writeFileSync('./composite.json', file);

var DeployerComposite = new SCA.Composite('DeployerComposite');
