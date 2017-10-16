define(function(require){
    return function Varying(glContext) {
        "use strict";
        var varying = (this instanceof Varying) ? this : {},
            ctx = glContext;

        varying.create = function(name, type, size) {
            varying[name] = {
                name: name,
                type: type || 'float',
                size: size || 1,
            };

            varying[name].link = function() {};

            varying[name].header = function() {
                var header = 'varying ' + this.type + ' ' + this.name;
                if(this.size > 1)
                    header += '[' + this.size + ']';
                return header + ';\n';
            }

            return varying[name];
        }

        return varying;
    }
});
