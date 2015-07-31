var SCA = require('./../../../service-component.js');
var ToDeploy = new SCA.Composite('ToDeploy', './../../ToDeploy/composites/composite'+process.argv[2]+'.json');
