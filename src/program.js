import Shader from './shader';

export default function Program(glContext, resources) {

    var program = {},
        ctx = glContext,
        kernels = {},
        shaders = new Shader(glContext, resources);

    function createShader(gl, type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }

    program.create = function(name, vs, fs) {
        var name = name || "default",
            vs = vs || "default",
            fs = fs || "default",
            deps = [];

        if (kernels.hasOwnProperty(name)) {
            this.delete(name);
        }

        kernels[name] = ctx.createProgram();

        kernels[name].vs = (typeof vs == "object") ? vs : shaders.vertex[vs];
        kernels[name].fs = (typeof fs == "object") ? fs : shaders.fragment[fs];

        ctx.attachShader(kernels[name], kernels[name].vs);
        ctx.attachShader(kernels[name], kernels[name].fs);
        ctx.linkProgram(kernels[name]);
        var linked = ctx.getProgramParameter(kernels[name], ctx.LINK_STATUS);
        if (!linked) {
            var lastError = ctx.getProgramInfoLog(kernels[name]);
            throw ("Error in program linking:" + lastError);
            ctx.deleteProgram(kernels[name]);
        }

        deps = deps.concat(kernels[name].vs.deps);
        deps = deps.concat(kernels[name].fs.deps);
        kernels[name].deps = deps;

    }

    program.use = function(name, vsource, fsource) {
        if (kernels.hasOwnProperty(name)) {
            ctx.useProgram(kernels[name]);
            resources.link(kernels[name], kernels[name].deps);
            return kernels[name];
        } else {
            var vs = createShader(ctx, ctx.VERTEX_SHADER, vsource);
            var fs = createShader(ctx, ctx.FRAGMENT_SHADER, fsource);
            this.create(name, vs, fs);
            ctx.useProgram(kernels[name]);
            resources.link(kernels[name], kernels[name].deps);
            return kernels[name];
        }
    }

    program.delete = function(name) {
        if (kernels.hasOwnProperty(name)) {
            ctx.detachShader(kernels[name], kernels[name].vs);
            ctx.detachShader(kernels[name], kernels[name].fs);
            ctx.deleteProgram(kernels[name]);
            delete kernels[name];
        }
    }

    program.shader = function(arg, fn) {
        var options = arg;
        shaders.create(options, fn);
        return program;
    }

    program.vertex = function(fn) {
        var options = {
            type: "vertex"
        };
        if (fn.name) options.name = fn.name;
        return shaders.create(options, fn);
    }

    program.fragment = function(fn) {
        var options = {
            type: "fragment"
        };
        if (fn.name) options.name = fn.name;
        return shaders.create(options, fn);
    }

    return program;
}
