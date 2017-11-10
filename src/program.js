define(function(require){
    const Shader = require('./shader');

    return function Program(glContext, resources) {
        'use strict';
        var program,
            ctx = glContext,
            pm = {},
            kernels = {},
            shaders = new Shader(glContext, resources);

        pm.create = function(name, vs, fs) {
            var name = name || "default",
                vs = vs || "default",
                fs = fs || "default",
                deps = [];

            if(kernels.hasOwnProperty(name)) {
                pm.delete(name);
            }

            kernels[name] = ctx.createProgram();

            kernels[name].vs = (typeof vs == "object") ? vs : shaders.vertex[vs],
            kernels[name].fs = (typeof fs == "object") ? fs : shaders.fragment[fs];

            ctx.attachShader(kernels[name], kernels[name].vs);
            ctx.attachShader(kernels[name], kernels[name].fs);
            ctx.linkProgram(kernels[name]);
            var linked = ctx.getProgramParameter(kernels[name], ctx.LINK_STATUS);
            if (!linked) {
                var lastError = ctx.getProgramInfoLog(kernels[name]);
                throw ("Error in program linking:" + lastError);
                ctx.deleteProgram(kernels[name]);
                return null;
            }

            deps = deps.concat(kernels[name].vs.deps);
            deps = deps.concat(kernels[name].fs.deps);
            kernels[name].deps = deps;

            return kernels[name];
        }

        pm.use = pm.program = function(name, vs, fs) {
            if(kernels.hasOwnProperty(name)) {
                program = kernels[name];
                ctx.useProgram(program);
                resources.link(program, program.deps);
                return program;
            } else {
                return pm.create(name, vs, fs);
            }

        }

        pm.delete = function(name) {
            if(kernels.hasOwnProperty(name)) {
                ctx.detachShader(kernels[name], kernels[name].vs);
                ctx.detachShader(kernels[name], kernels[name].fs);
                ctx.deleteProgram(kernels[name]);
                delete kernels[name];
            }
        }

        pm.shader = function(arg, fn) {
            var options = arg;
            shaders.create(options, fn);
            return pm;
        }

        pm.shader.vertex = function(fn) {
            var options = {type: "vertex"};
            if (fn.name) options.name = fn.name;
            return shaders.create(options, fn);
        }

        pm.shader.fragment = function(fn) {
            var options = {type: "fragment"};
            if (fn.name) options.name = fn.name;
            return shaders.create(options, fn);
        }

        return pm;
    }

});
