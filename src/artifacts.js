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
                properties : {},
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

Artifacts.prototype.setProperty = function (name, value) {
    if (this.data.hasOwnAttribute('properties') == false) this.data.properties = {};
    this.data.properties[name] = value;
}

Artifacts.prototype.getProperty = function (name) {
    return this.data.properties && this.data.properties[name] ? this.data.properties.name : null;
}

module.exports = Artifacts;
