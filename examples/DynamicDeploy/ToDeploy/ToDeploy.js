var SCA = require('./../../../sca.js');
var ToDeploy = new SCA.Composite('ToDeploy', './../../ToDeploy/composites/composite'+process.argv[2]+'.json');
