if(typeof(define) !== 'function') var define = require('amdefine')(module);

define(function(require){
    var Texture = require('./texture');
    return function Framebuffer(glContext) {
        "use strict";
        var framebuffer = (this instanceof Framebuffer) ? this : {},
            ctx = glContext;

        framebuffer.create = function(name, type, dim, texture) {

            framebuffer[name] = {
                ptr: ctx.createFramebuffer(),
                name: name,
                type: type || "float",
                width: dim[0] || 1024,
                height: dim[1] || 1024,
                texture: texture || null,
            }

            if(framebuffer[name].texture === null) {
                framebuffer[name].texture = Texture(ctx).create(name, type, dim, "rgba", new Float32Array(width*height));
            }

            var renderbuffer = ctx.createRenderbuffer();
            ctx.bindFramebuffer(ctx.FRAMEBUFFER, framebuffer[name].ptr);
            ctx.bindRenderbuffer(ctx.RENDERBUFFER, renderbuffer);
            ctx.renderbufferStorage(ctx.RENDERBUFFER, ctx.DEPTH_COMPONENT16, framebuffer[name].width, framebuffer[name].height);

            ctx.framebufferTexture2D(ctx.FRAMEBUFFER, ctx.COLOR_ATTACHMENT0, ctx.TEXTURE_2D,  framebuffer[name].texture.ptr, 0);
            ctx.framebufferRenderbuffer(ctx.FRAMEBUFFER, ctx.DEPTH_ATTACHMENT, ctx.RENDERBUFFER, renderbuffer);

            ctx.bindTexture(ctx.TEXTURE_2D, null);
            ctx.bindRenderbuffer(ctx.RENDERBUFFER, null);
            ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);

            framebuffer[name].enableRead = function(program) {
                ctx.activeTexture(ctx.TEXTURE0 + this.texture.index);
                ctx.bindTexture(ctx.TEXTURE_2D, this.texture.ptr);
                this.texture.location = ctx.getUniformLocation(program, this.texture.name);
                ctx.uniform1i(this.texture.location, this.texture.index);
            }
            return framebuffer[name];
        }

        return framebuffer;
    }
});
