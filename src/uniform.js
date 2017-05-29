if (typeof(define) !== 'function') var define = require('amdefine')(module);

define(function(require){
    return function Uniform(glContext, name, type, data) {
        'use strict';
        var uniform = (this instanceof Uniform) ? this : {},
            ctx = glContext;

        function serializeArray(arrayOfArray) {
            var sa = [];
            arrayOfArray.forEach(function(a){
                sa = sa.concat(a);
            })
            return sa;
        }

        function setUniform() {
            var type = this.type,
                location = this.location,
                size = this.size,
                data = this.data;

            if(Array.isArray(data)) {
                var hasArray = data.filter(function(d){return Array.isArray(d);});
                if(hasArray)
                    data = serializeArray(data);
            }

            if((type == 'float' || type == 'int') && !Array.isArray(data))
                data = [data];

            var buf;
            if (type.slice(0,3) == 'vec' || type == 'float') {
                buf = new Float32Array(data);
                ctx['uniform' + size + 'fv'](location, buf);
            } else if(type.slice(0,4) == 'ivec' || type == 'int'){
                buf = new Int32Array(data);
                ctx['uniform' + size + 'iv'](location, buf);
            } else if(type.slice(0,3) == 'mat') {
                buf = new Float32Array(data);
                ctx['uniformMatrix' + size + 'fv'](location, false, buf);
            } else if(type == 'sampler2D') {
                if(data.hasOwnProperty('resourceType') && data.resourceType == 'texture') {
                    ctx.activeTexture(ctx.TEXTURE0 + data.index);
                    ctx.bindTexture(ctx.TEXTURE_2D, data.ptr);
                    ctx.uniform1i(location, data.index);
                }
            }
        }

        uniform.create = function(name, type, data) {

            if(Array.isArray(data)) {
                var hasArray = data.filter(function(d){return Array.isArray(d);});
                if(hasArray)
                    data = serializeArray(data);
            }

            uniform[name] = {
                type: type,
                name: name,
                data: data,
                location: null,
                size: parseInt(type.slice(3,4)) || parseInt(type.slice(4,5)) || 1
            };

            uniform[name].link = function(program) {
                if(typeof this.data !== 'undefined' && this.data !== null) {
                    this.location = ctx.getUniformLocation(program, this.name);
                    setUniform.call(this);
                }
                return this;
            };

            uniform[name].load = function(data) {
                this.data = data;
                return this;
            };

            uniform[name].header = function() {
                var header = 'uniform ' + this.type + ' ' + this.name,
                    len = 0;

                if(this.type != 'sampler2D') {
                    len = this.data.length / this.size;
                }

                //TODO: fix declaration for matrix
                if(len > 1 && type != 'mat4') {
                    header += '[' + len + ']';
                }
                return header + ';\n';
            };

            return uniform[name];
        }


        return uniform;
    }
});
