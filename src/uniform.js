if (typeof(define) !== 'function') var define = require('amdefine')(module);

define(function(require){
    return function Uniform(glContext, name, type, data) {
        "use strict";
        var uniform = (this instanceof Uniform) ? this : {},
            ctx = glContext;

        function setUniform(type, location, data) {
            if(!Array.isArray(data)) var data = [data];
            switch(type) {
                case "float":
                    ctx.uniform1fv(location, data);
                    break;
                case "vec2":
                    ctx.uniform2fv(location, Float32Array.from(data));
                    break;
                case "vec3":
                    ctx.uniform3fv(location, Float32Array.from(data));
                    break;
                case "vec4":
                    ctx.uniform4fv(location, Float32Array.from(data));
                    break;
                case "int":
                    ctx.uniform1iv(location, data);
                    break;
                case "ivec2":
                    ctx.uniform2iv(location, Int32Array.from(data));
                    break;
                case "ivec3":
                    ctx.uniform3iv(location, Int32Array.from(data));
                    break;
                case "ivec4":
                    ctx.uniform4iv(location, Int32Array.from(data));
                    break;
                case "mat2":
                    ctx.uniformMatrix2fv(location, Float32Array.from(data));
                    break;
                case "mat3":
                    ctx.uniformMatrix3fv(location, Float32Array.from(data));
                    break;
                case "mat4":
                    ctx.uniformMatrix4fv(location, Float32Array.from(data));
                    break;
            }
        }

        uniform.create = function(name, type, data) {
            uniform[name] = {
                type: type,
                name: name,
                data: data,
                location: null,
                size: parseInt(type.slice(3,4)) || parseInt(type.slice(4,5)) || 1
            };

            uniform[name].link = function(program) {
                if(this.data !== null) {
                    this.location = ctx.getUniformLocation(program, this.name);
                    setUniform(this.type, this.location, this.data);
                }
                return this;
            };

            uniform[name].load = function(data) {
                this.data = data;
                return this;
            };

            uniform[name].header = function() {
                var header = 'uniform ' + this.type + ' ' + this.name,
                    len = this.data.length / this.size;
                if(len > 1) {
                    header += '[' + len + ']';
                }
                return header + ';\n';
            };

            return uniform[name];
        }

        return uniform;
    }
});
