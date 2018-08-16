export default function Shader(glContext, glResource) {
    
    var shader = (this instanceof Shader) ? this : {},
        ctx = glContext,
        resource = glResource,
        parameters = ctx._dict || {};

    shader.vertex = {};
    shader.fragment = {};

    var shaderType = {
        vertex: ctx.VERTEX_SHADER,
        fragment: ctx.FRAGMENT_SHADER
    };

    function createShader(type, source) {
        var shader = ctx.createShader(type);
        ctx.shaderSource(shader, source);
        ctx.compileShader(shader);
        var success = ctx.getShaderParameter(shader, ctx.COMPILE_STATUS);
        if (success) {
            return shader;
        }
        console.log(ctx.getShaderInfoLog(shader));
        ctx.deleteShader(shader);
    }

    shader.createVertexShader = function(source){
        shader.vs = createShader(shaderType.vertex, source);
    }

    shader.createFragmentShader = function(source){
        shader.fs = createShader(shaderType.fragment, source);
    }

    return shader;
}
