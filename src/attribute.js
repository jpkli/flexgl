define(function(){
    return function Attribute(glContext) {
        "use strict";
        var attribute = (this instanceof Attribute) ? this : {},
            ctx = glContext,
            attributeID = 0;

        function setAttribute(name, data) {
            if(Array.isArray(data) || ArrayBuffer.isView(data)){
                if(!ArrayBuffer.isView(data)) data = new Float32Array(data);
                attribute[name].data = data;
                ctx.bindBuffer(ctx.ARRAY_BUFFER, attribute[name].ptr);
                ctx.bufferData(ctx.ARRAY_BUFFER, data, ctx.STATIC_DRAW);
            }
        }
        attribute.create = function(name, type, data) {
            attribute[name] = {
                name: name,
                type: type || 'float',
                data: null,
                location: attributeID++,
                ptr: ctx.createBuffer(),
                size: parseInt(type.slice(3,4)) || 1
            };

            if(data !== null && data.length) setAttribute(name, data);

            attribute[name].link = function(program) {
                ctx.bindBuffer(ctx.ARRAY_BUFFER, this.ptr);
                this.location = ctx.getAttribLocation(program, this.name);
                ctx.vertexAttribPointer(this.location, this.size, ctx.FLOAT, false, 0, 0);
                ctx.enableVertexAttribArray(this.location);
                return this;
            }

            attribute[name].load = function(arrayBuffer) {
                setAttribute(this.name, arrayBuffer);
                return this;
            }

            attribute[name].header = function() {
                return 'attribute ' + this.type + ' ' + this.name + ';\n';
            }

            attribute[name].delete = function() {
                ctx.deleteBuffer(this.ptr);
            }

            return attribute[name];
        };

        return attribute;
    }
});
