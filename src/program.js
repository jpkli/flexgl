import Shader from './shader';

export default function Program(glContext, resources) {

    var program = {},
        ctx = glContext,
        kernels = {},
        shader = new Shader(glContext);

    program.create = function(name, vs, fs) {
        var name = name || "default",
            vs = vs || "default",
            fs = fs || "default",
            deps = [];

        if (kernels.hasOwnProperty(name)) {
            this.delete(name);
        }

        kernels[name] = ctx.createProgram();
        kernels[name].vs = vs;
        kernels[name].fs = fs;

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

    program.use = function(name, vertex_shader_source, fragment_shader_source) {
        if (kernels.hasOwnProperty(name)) {
            ctx.useProgram(kernels[name]);
            resources.link(kernels[name], kernels[name].deps);
            return kernels[name];
        } 
        else {
            shader.create(name, vertex_shader_source, fragment_shader_source);
            this.create(name, shader[name].vs, shader[name].fs);
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

    return program;
}
