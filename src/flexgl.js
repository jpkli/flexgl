if (typeof(define) !== 'function') var define = require('amdefine')(module);

define(function(require){
    var Resource = require('./resource'),
        Shader = require('./shader'),
        Framebuffer = require('./framebuffer');

    return function FlexGL(arg){
        'use strict';
        var flexgl = (this instanceof FlexGL) ? this : {},
            options = arg || {},
            containerId = options.container || "body",
            canvas = options.canvas || document.createElement("canvas"),
            width = options.width || 400,
            height = options.height || 300,
            padding = options.padding || {left: 0, right: 0, top: 0, bottom: 0},
            ctx = null,
            kernels = {},
            program = null,
            env = options.env || {},
            sharedFunction = options.sharedFunction ||  {};


        if(typeof(canvas) == "string") {
            if(canvas[0] == "#") canvas = document.getElementById(cavnas.substring(1));
            else canvas = document.getElementById(cavnas);
        }

        canvas.width = width ;
        canvas.height = height ;
        // canvas.style.position = "absolute";
        // canvas.style.border = "1px solid #000";
        canvas.style.marginLeft = padding.left + "px";
        canvas.style.marginTop = padding.top + "px";

        ctx = setupWebGL(canvas);
        flexgl.ctx = ctx;
        flexgl.canvas = canvas;

        var resources = new Resource(ctx),
            framebuffers = new Framebuffer(ctx),
            shaders = new Shader(ctx, resources, env);

        var blendExt = ctx.getExtension("EXT_blend_minmax");
        if(blendExt) {
            ctx.MAX_EXT = blendExt.MAX_EXT;
            ctx.MIN_EXT = blendExt.MIN_EXT;
        }

        ctx.ext = ctx.getExtension("ANGLE_instanced_arrays");
        enableExtension([
            "OES_texture_float",
            "OES_texture_float_linear",
        ]);

        if(containerId == "body") {
            document.getElementsByTagName(containerId)[0].appendChild(canvas);
        } else {
            document.getElementById(containerId).appendChild(canvas);

        }

        function setupWebGL(canvas) {
            var names = ["webgl", "experimental-webgl"];
            var gl = null;
            for (var i = 0; i < names.length; ++i) {
                try {
                    gl = canvas.getContext(names[i]);
                } catch(e) {}
                if (gl) break;
            }

            return gl;
        }

        function enableExtension(extensions) {
            if(!Array.isArray(extensions)) extensions = [extensions];
            extensions.forEach(function(extension){
                var extProps = ctx.getExtension(extension);
                if(extProps !== null) {
                    Object.keys(extProps).forEach(function(ep){
                        if(!ext.hasOwnProperty(ep)){
                            ctx.ext[ep] = extProps[ep];
                        }
                    })
                }
            });
        };

        flexgl.enableExtension = enableExtension;

        flexgl.attribute = function(name, type, data) {
            resources.allocate("attribute", name, type, data);
            Object.defineProperty(flexgl.attribute, name, {
                get: function() { return resources.attribute[name];},
                set: function(data) { resources.attribute[name].load(data); }
            });
            return flexgl;
        };

        flexgl.uniform = function(name, type, data) {
            resources.allocate("uniform", name, type, data);
            if(!flexgl.uniform.hasOwnProperty(name)){
                Object.defineProperty(flexgl.uniform, name, {
                    get: function() { return resources.uniform[name]; },
                    set: function(data) {
                        resources.uniform[name].load(data);
                        resources.uniform[name].link(program);
                    }
                });
            }
            return flexgl;
        };

        flexgl.uniform.serialize = function(aoa) {
            var sa = [];
            aoa.forEach(function(a){
                sa = sa.concat(a);
            })
            return sa;
        }

        flexgl.texture = function(name, type, data, dim, channel){
            resources.allocate("texture", name, type, dim, channel, data);
            Object.defineProperty(flexgl.texture, name, {
                get: function() { return resources.texture[name]; },
                set: function(data) { resources.texture[name].load(data); }
            });
            return flexgl;
        }

        flexgl.texture.update = function(name, data, offset, dim){
            console.log(resources.texture[name].update);
            resources.texture[name].update(data, offset, dim);
        }

        flexgl.varying = function(name, type, size) {
            resources.allocate("varying", name, type, size);
            return flexgl;
        };

        flexgl.framebuffer = function(name, type, dim) {
            var texture = resources.allocate('texture', name, type, dim, 'rgba', null);
            framebuffers.create(name, type, dim, texture);
            if(!flexgl.framebuffer.hasOwnProperty(name)){
                Object.defineProperty(flexgl.framebuffer, name, {
                    get: function() { return framebuffers[name]; }
                });
            }
            return flexgl;
        }

        flexgl.framebuffer.enableRead = function(name) {
            framebuffers[name].enableRead(program);
        }

        flexgl.bindFramebuffer = function(fbName) {
            ctx.bindFramebuffer(ctx.FRAMEBUFFER, framebuffers[fbName].ptr);
        }

        flexgl.subroutine = function(name, type, fn) {
            resources.allocate("subroutine", name, type, fn);
            return flexgl;
        }

        flexgl.parameter= function(keyValuePairs) {
            Object.keys(keyValuePairs).forEach(function(key){
                env[key] = keyValuePairs[key];
                if(Array.isArray(env[key])){
                    var i = 0;
                    Object.defineProperty(env, key, {
                        get: function() { return keyValuePairs[key][i++];},
                        set: function(newArray) {
                            i = 0;
                            env[key] = newArray;
                        }
                    });
                }
            })
            return flexgl;
        }

        flexgl.env = flexgl.parameter;

        flexgl.shader = function(arg, fn){
            var options = arg;
            shaders.create(options, fn);
            return flexgl;
        }

        flexgl.shader.vertex = function(fn){
            var options = {type: "vertex"};
            if(fn.name) options.name = fn.name;
            return shaders.create(options, fn);
        }

        flexgl.shader.fragment = function(fn){
            var options = {type: "fragment"};
            if(fn.name) options.name = fn.name;
            return shaders.create(options, fn);
        }

        flexgl.program = function(name, vs, fs, framebufferName) {
            var name = name || "default",
                vs= vs|| "default",
                fs = fs || "default",
                deps = [];

            if(!kernels.hasOwnProperty(name)) {

                kernels[name] = ctx.createProgram();

                var vertShader = (typeof vs == "object") ? vs : shaders.vertex[vs],
                    fragShader = (typeof fs == "object") ? fs : shaders.fragment[fs];

                // if(!shaders.vertex.hasOwnProperty(vs) || !shaders.fragment.hasOwnProperty(fs))
                //     throw new Error("No vertex or fragment shader is provided!");

                ctx.attachShader(kernels[name], vertShader);
                ctx.attachShader(kernels[name], fragShader);
                ctx.linkProgram(kernels[name]);
                var linked = ctx.getProgramParameter(kernels[name], ctx.LINK_STATUS);
                if (!linked) {
                    var lastError = ctx.getProgramInfoLog(kernels[name]);
                    throw ("Error in program linking:" + lastError);
                    ctx.deleteProgram(kernels[name]);
                    return null;
                }

                deps = deps.concat(vertShader.deps);
                deps = deps.concat(fragShader.deps);
                kernels[name].deps = deps;
            }

            program = kernels[name];
            ctx.useProgram(program);
            resources.link(program, program.deps);
            return ctx;
        }

        flexgl.dimension = function() {
            return [canvas.width, canvas.height];
        }

        return flexgl;
    }
});
