export default function Shader(glContext) {
    
    var shader = (this instanceof Shader) ? this : {},
        ctx = glContext;
        // resource = glResource,
        // parameters = ctx._dict || {};

    shader.create = function(name, vertex_shader_source, fragment_shader_source){
        shader[name] = {
            name: name,
            vertex_shader_source: vertex_shader_source, 
            fragment_shader_source: fragment_shader_source, 
            vs: createShader(ctx, ctx.VERTEX_SHADER, vertex_shader_source),
            fs: createShader(ctx, ctx.FRAGMENT_SHADER, fragment_shader_source)
        }

        shader[name].vs.deps = [];
        addDeps(vertex_shader_source, shader[name].vs.deps);
        shader[name].fs.deps = [];
        addDeps(fragment_shader_source, shader[name].vs.deps);

        function createShader(gl, type, source) {
            var shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
            if (success) {
                return shader;
            }
            // console.log('NO!');
            console.log(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
        }

        function addDeps(source, deps){
            var re = /\s*(attribute|uniform)\s+\w+\s+(\w+)/;        
            source.split('\n').forEach(function(v){
                var result = re.exec(v);
                if(result){
                    deps.push(result[2]);
                }
            });
        }
    }

    return shader;
}
