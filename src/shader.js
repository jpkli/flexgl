if(typeof(define) !== 'function') var define = require('amdefine')(module);

define(function(require){
    return function Shader(glContext, glResource, glslParameters) {
        'use strict';
        var shader = (this instanceof Shader) ? this : {},
            ctx = glContext,
            resource = glResource,
            parameters = glslParameters || {};

        shader.vertex = {};
        shader.fragment = {};

        var shaderType = {
            vertex: ctx.VERTEX_SHADER,
            fragment: ctx.FRAGMENT_SHADER
        };

        function applyEnvParameters(str){
            //find all $(...) and replace them with parameters
            var envParam = Object.keys(parameters);
            if(envParam.length > 0){
                var re = new RegExp("\\$\\(("+envParam.join("|")+")\\)","g");
                str = str.replace(re, function(matched){
                    return parameters[matched.slice(2,matched.length-1)];
                });
            }

            // Make uniforms to be used as parameters in shaders, like $(uniformName)
            // var envUniforms = Object.keys(resource.uniform);
            // re = new RegExp("\\$\\(("+envUniforms.join("|")+")\\)","g");
            // str = str.replace(re, function(matched){
            //     return resource.uniform[matched.slice(2,matched.length-1)].data;
            // });

            return str;
        }

        function toGLSL(returnType, name, fn){
            var glsl = returnType + ' ' +
                name + '(' + applyEnvParameters(fn.toString())
                .replace(/var\s/g, 'float ')
                .replace(/\$(.*)\((.*)\)\s*(=|;)/g, "$1 $2 $3");
                // .replace(/\$(.*?)\./g, "$1 ")

            if(name == "main") {
                glsl = glsl.replace(/function.+\(\s*([\s\S]*?)\s*{/, '){') + "\n";
            } else {
                var args = glsl.match(/function.+\(\s*([\s\S]*?)\s*\)/)[1];
                if(args != "") {
                    args = args.replace(/\$([\w|\d]+)_/g, "$1 ");
                }
                glsl = glsl.replace(/function.+\(\s*([\s\S]*?)\s*\)/, args+')') + "\n";
            }

            return glsl;
        }

        function compile(shaderType, shaderSource) {
            if (shaderType !== ctx.VERTEX_SHADER && shaderType !== ctx.FRAGMENT_SHADER) {
                throw ("Error: unknown shader type");
            }

            var _shader = ctx.createShader(shaderType);
            ctx.shaderSource(_shader, shaderSource);
            ctx.compileShader(_shader);

            // Check the compile status, get compile error if any
            var compiled = ctx.getShaderParameter(_shader, ctx.COMPILE_STATUS);
            if (!compiled) {
                var lastError = ctx.getShaderInfoLog(_shader);
                throw new Error("Error compiling shader '" + _shader + "':" + lastError);
                ctx.deleteShader(_shader);
                return null;
            }

            return _shader;
        }

        function getDeps(fn) {
            var args = fn.toString().match(/function\s.*?\(([^)]*)\)/)[1];
            // args = args.replace(/(?:\r\n|\r|\n|\s)/g, '');
            return args.split(',').map(function(arg) {
                return arg.replace(/\/\*.*\*\//, '').trim();
            }).filter(function(arg) {
                return arg;
            });
        }

        function declareDep(dep) {
            var res = resource.get(dep);
            if(typeof res === 'undefined')
                throw new Error('Resource/dependence "' + dep + '" is not found.');
            if(res.resourceType == 'subroutine')
                return toGLSL(res.type, res.name, res.fn);
            else
                return res.header();
        }

        shader.create = function(arg, fn){
            var option = arg || {},
                name = option.name || "default",
                type = option.type || "vertex",
                deps = option.require || option.deps || [],
                precision = option.precision || "high",
                debug = option.debug || false,
                main = option.main || fn || function() {};

            var shaderSource = 'precision ' + precision + 'p float;\n';

            if(deps.length === 0) deps = getDeps(main);

            if(Array.isArray(deps)){
                deps.forEach(function(dep){
                    shaderSource += declareDep(dep);
                });
            } else if(typeof(deps) == 'object') {
                Object.keys(deps).forEach(function(resourceType){
                    deps[resourceType].forEach(function(dep){
                        shaderSource += declareDep(dep);
                    });
                })
            }

            shaderSource += toGLSL('void', 'main', main);
            if(debug) console.log(shaderSource);
            var _shader = compile(shaderType[type], shaderSource);
            _shader._shaderType = shaderType[type];
            _shader.deps = deps;
            _shader.source = shaderSource;
            shader[type][name] = _shader;
            return _shader;
        }

        return shader;
    }
});
