var fs = require('fs');
var path = require('path');

var Artifacts = function (filePath, data) {
    this.filePath = path.resolve(process.cwd(),filePath);
    
    if (fs.existsSync(this.filePath)) {
        var file = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
        this.data = file;
    }
    else {
        if (data) {
            this.data = data;
        }
        else {
            this.data = {
                name : 'unknown' + parseInt(Math.random()*10000),
                host : null,
                port : null,
                services : {},
                components : {}
            }
        }
    }
}

Artifacts.prototype.getComponent = function (componentName) {
    return this.data.components[componentName];
}

Artifacts.prototype.save = function (serviceName) {
    return fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 4));
};

module.exports = Artifacts;
