/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Uniform;
function Uniform(glContext, name, type, data) {

    var uniform = (this instanceof Uniform) ? this : {},
        ctx = glContext;

    function serializeArray(arrayOfArray) {
        var sa = [];
        arrayOfArray.forEach(function(a){
            sa = sa.concat(a);
        })
        return sa;
    }

    function setUniform() {
        var type = this.type,
            location = this.location,
            size = this.size,
            data = this.data;

        if(Array.isArray(data)) {
            var hasArray = data.filter(function(d){return Array.isArray(d);});
            if(hasArray)
                data = serializeArray(data);
        }

        if((type == 'float' || type == 'int') && !Array.isArray(data) && !ArrayBuffer.isView(data))
            data = [data];

        var buf;
        if (type.slice(0,3) == 'vec' || type == 'float') {
            buf = new Float32Array(data);
            ctx['uniform' + size + 'fv'](location, buf);
        } else if(type.slice(0,4) == 'ivec' || type == 'int'){
            buf = new Int32Array(data);
            ctx['uniform' + size + 'iv'](location, buf);
        } else if(type.slice(0,3) == 'mat') {
            buf = new Float32Array(data);
            ctx['uniformMatrix' + size + 'fv'](location, false, buf);
        } else if(type == 'sampler2D') {
            if(data.hasOwnProperty('resourceType') && data.resourceType == 'texture') {
                ctx.activeTexture(ctx.TEXTURE0 + data.index);
                ctx.bindTexture(ctx.TEXTURE_2D, data.ptr);
                ctx.uniform1i(location, data.index);
            }
        }
    }

    uniform.create = function(name, type, data) {

        if(Array.isArray(data)) {
            var hasArray = data.filter(function(d){return Array.isArray(d);});
            if(hasArray)
                data = serializeArray(data);
        }

        uniform[name] = {
            type: type,
            name: name,
            data: data,
            location: null,
            size: parseInt(type.slice(3,4)) || parseInt(type.slice(4,5)) || 1
        };

        uniform[name].link = function(program) {
            if(typeof this.data !== 'undefined' && this.data !== null) {
                this.location = ctx.getUniformLocation(program, this.name);
                setUniform.call(this);
            }
            return this;
        };

        uniform[name].load = function(data) {
            this.data = data;
            return this;
        };

        uniform[name].header = function() {
            var header = 'uniform ' + this.type + ' ' + this.name,
                len = 0;

            if(this.type != 'sampler2D') {
                len = this.data.length / this.size;
            }

            //TODO: fix declaration for matrix
            if(len > 1 && type != 'mat4') {
                header += '[' + len + ']';
            }
            return header + ';\n';
        };

        return uniform[name];
    }


    return uniform;
}


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Texture;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__uniform__ = __webpack_require__(0);


function Texture(glContext) {

    var texture = (this instanceof Texture) ? this : {},
        ctx = glContext,
        textureID = 0;

    function setTexture(name, texData) {
        var type = ctx[texture[name].type.toUpperCase()],
            format = ctx[texture[name].channel.toUpperCase()],
            width = texture[name].dim[0],
            height = texture[name].dim[1];

        texture[name].data = texData;

        ctx.bindTexture(ctx.TEXTURE_2D, texture[name].ptr);
        ctx.texImage2D(ctx.TEXTURE_2D, 0, format, width, height, 0, format, type, texData);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.NEAREST);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
        ctx.bindTexture(ctx.TEXTURE_2D, null);
    }

    function updateTexture(name, texData, offset, dim) {
        var type = ctx[texture[name].type.toUpperCase()],
            format = ctx[texture[name].channel.toUpperCase()],
            width = dim[0] || texture[name].dim[0],
            height = dim[1] || texture[name].dim[1];

        ctx.bindTexture(ctx.TEXTURE_2D, texture[name].ptr);
        ctx.texSubImage2D(ctx.TEXTURE_2D, 0, offset[0], offset[1], width, height, format, type, texData);
        ctx.bindTexture(ctx.TEXTURE_2D, null);
    }

    // TODO: Add support for texture compression
    // function compressTexture(texData) {
    //
    //     var ext = (
    //       ctx.getExtension("WEBGL_compressed_texture_s3tc") ||
    //       ctx.getExtension("MOZ_WEBGL_compressed_texture_s3tc") ||
    //       ctx.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc")
    //     );
    //
    //     ctx.compressedTexImage2D(ctx.TEXTURE_2D, 0, ext.COMPRESSED_RGBA_S3TC_DXT3_EXT, texture[name].dim[0], texture[name].dim[1], 0, texData);
    //     ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);
    //     ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR);
    // }

    texture.create = function(name, type, dim, channel, data, sampler) {
        var texIndex = (texture.hasOwnProperty(name)) ? texture[name].index : textureID++;
        texture[name] = {
            name: name,
            index: texIndex,
            type: type || "float",
            dim: dim || [512, 512],
            channel: channel || "alpha",
            data: null,
            location: null,
            sampler: sampler || null,
            ptr: ctx.createTexture()
        };

        // if(data !== null && data.length)
        setTexture(name, data);

        if (texture[name].sampler === null) {
            texture[name].sampler = Object(__WEBPACK_IMPORTED_MODULE_0__uniform__["a" /* default */])(ctx).create(name, 'sampler2D', texture[name]);
        } else {
            texture[name].sampler.data = texture[name];
        }

        texture[name].link = function(program) {
            if (this.data !== null) {
                // ctx.activeTexture(ctx.TEXTURE0 + this.index);
                // ctx.bindTexture(ctx.TEXTURE_2D, this.ptr);
                // this.location = ctx.getUniformLocation(program, this.name);
                // ctx.uniform1i(this.location, this.index);
                if (typeof(this.sampler.data) == 'undefined' || this.sampler.data === null)
                    this.sampler.data = texture[name];

                this.sampler.link(program);
            }
            return this;
        }

        texture[name].load = function(texData) {
            setTexture(this.name, texData);
            return this;
        }

        texture[name].copyFromFBO = function() {
            ctx.bindTexture(ctx.TEXTURE_2D, this.ptr);
            ctx.copyTexImage2D(
                ctx.TEXTURE_2D,
                0,
                ctx.RGBA,
                0,
                0,
                this.dim[0],
                this.dim[1],
                0
            );
            ctx.bindTexture(ctx.TEXTURE_2D, null);
        }

        texture[name].update = function(texData, offset, dim) {
            updateTexture(this.name, texData, offset, dim);
            return this;
        }

        texture[name].resize = function(dim, data) {
            this.dim = dim;
            setTexture(this.name, data);
        }

        texture[name].delete = function() {
            glContext.deleteTexture(this.ptr);
        }

        texture[name].header = function() {
            if (this.name == this.sampler.name)
                return 'uniform sampler2D ' + this.sampler.name + ';\n';
            else
                return '';
        }

        return texture[name];
    }

    return texture;
}


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Shader;
function Shader(glContext, glResource) {
    
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

    // Convert JS functions to GLSL codes
    function toGLSL(returnType, name, fn){

        var glsl = returnType + ' ' +
            name + '(' + applyEnvParameters(fn.toString())
            .replace(
                /var\s+([\w|\d]+)\s*=\s*new\s+([\w|\d]+)\((.*)\)/g,
                function(expr, name, dtype, value){
                    var parts;
                    if(value)
                        parts = [dtype.toLowerCase(), name, '=', value];
                    else
                        parts = [dtype.toLowerCase(), name];

                    return parts.join(' ')
                }
            )
            .replace(/for\s*\(\s*var\s+/g, 'for(int ')
            .replace(/var\s/g, 'float ')
            .replace(/this./g, '')
            .replace(/\$(.*)\((.*)\)\s*(=|;)/g, "$1 $2 $3");
            // .replace(/\$(.*?)\./g, "$1 ")

        if(name == "main") {
            glsl = glsl.replace(/function.*\(\s*([\s\S]*?)\s*{/, '){') + "\n";
        } else {
            var args = glsl.match(/function.*\(\s*([\s\S]*?)\s*\)/)[1];

            if(args != "") {
                args = args.replace(/\$([\w|\d]+)_/g, "$1 ");
            }
            glsl = glsl
                .replace(/function.*\(\s*([\s\S]*?)\s*\)/, args+')') + "\n";
        }
        return glsl;
    }

    //set parameters in JS functions before converting to GLSL codes
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
            console.log(shaderSource + '\n ====================================================');
            throw new Error("Error compiling shader '" + _shader + "':" + lastError);

            ctx.deleteShader(_shader);
            return null;
        }

        return _shader;
    }

    function getDeps(fn) {
        var deps = [],
            sourceCode = fn.toString(),
            shaderArgs = sourceCode.match(/function\s.*?\(([^)]*)\)/),
            args = (shaderArgs !== null && shaderArgs.length) ? shaderArgs[1] : [];
        // args = args.replace(/(?:\r\n|\r|\n|\s)/g, '');
        //
        if(args.length) {
            deps = args.split(',').map(function(arg) {
                return arg.replace(/\/\*.*\*\//, '').trim();
            }).filter(function(arg) {
                return arg;
            });
        }

        var extraDeps = getExtraDeps(sourceCode);
        if(extraDeps.length) {
            deps = deps.concat(extraDeps
            .filter(function(d){
                return deps.indexOf(d) === -1;
            }))
        }

        return deps;
    }

    function getExtraDeps(fnString) {
        var extraDeps = fnString.match(/this\.(\w+)/g);
        if(extraDeps !== null) {
            extraDeps = extraDeps.map(function(d){
                return d.slice(5);
            });
        }
        return extraDeps || [];
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

    function uniqueDeps(deps) {
        var names = {};
        deps.forEach(function(d, i){
            names[d] = i;
        });

        return Object.keys(names);
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

        if(deps.length === 0) deps = uniqueDeps(getDeps(main));

        //get dependence from subroutines if any
        var extraDeps = [],
            subRoutines = [];

        deps.forEach(function(dep){
            var res = resource.get(dep);
            if(typeof res == 'undefined') {
                console.log(dep);
                throw Error ('Error! Undefined variable in shader: '+  dep.name);
            }
            if(res.resourceType == 'subroutine') {
                subRoutines.push(res.name);
                var subDeps = getExtraDeps(res.fn.toString());
                if(subDeps.length) {
                    //TODO: make this recursive to check all subroutine deps
                    subDeps.forEach(function(sdep){
                        var sres = resource.get(sdep);
                        if(sres.resourceType == 'subroutine')
                            extraDeps = extraDeps.concat(getExtraDeps(sres.fn.toString()));
                    })

                    extraDeps = extraDeps.concat(subDeps);
                }
            }
        })

        if(extraDeps.length) {
            var allDeps = extraDeps
            // .filter(function(d){
            //     return deps.indexOf(d) === -1;
            // })
            .concat(deps.filter(function(d){
                return subRoutines.indexOf(d) === -1;
            }))
            .concat(subRoutines);

            deps = uniqueDeps(allDeps);
        }


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
        if(debug)
            console.log(shaderSource);
        var _shader = compile(shaderType[type], shaderSource);
        _shader._shaderType = shaderType[type];
        _shader.deps = deps;
        _shader.source = shaderSource;
        shader[type][name] = _shader;
        return _shader;
    }

    return shader;
}


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* WEBPACK VAR INJECTION */(function(global, module) {/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_main__ = __webpack_require__(6);


var root = typeof self == 'object' && self.self === self && self ||
           typeof global == 'object' && global.global === global && global ||
           this;

root.flexgl = __WEBPACK_IMPORTED_MODULE_0__src_main__["a" /* default */];

/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_0__src_main__["a" /* default */]);

if(typeof module != 'undefined' && module.exports)
    module.exports = __WEBPACK_IMPORTED_MODULE_0__src_main__["a" /* default */];
/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(4), __webpack_require__(5)(module)))

/***/ }),
/* 4 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = function(originalModule) {
	if(!originalModule.webpackPolyfill) {
		var module = Object.create(originalModule);
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		Object.defineProperty(module, "exports", {
			enumerable: true,
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = FlexGL;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__resource__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__program__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__shader__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__framebuffer__ = __webpack_require__(12);





function FlexGL(arg) {

    var flexgl = (this instanceof FlexGL) ? this : {},
        options = arg || {},
        container = options.container || null,
        canvas = options.canvas || document.createElement("canvas"),
        width = options.width || null,
        height = options.height || null,
        padding = options.padding || {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        },
        ctx = options.context || options.ctx || null,
        kernels = {},
        program = null,
        glAttr = options.attributes || {},
        sharedFunction = options.sharedFunction || {};


    if (typeof(canvas) == "string") {
        if (canvas[0] == "#") canvas = document.getElementById(cavnas.substring(1));
        else canvas = document.getElementById(cavnas);
    }
    if (container) {
        container = (typeof(container) == "string") ? document.getElementById(container) : container;
        if (width === null) width = container.clientWidth;
        if (height === null) height = container.clientHeight;
    }
    // width -= padding.left + padding.right;
    // height -= padding.top + padding.bottom;
    canvas.width = width;
    canvas.height = height;
    canvas.style.position = "absolute";
    canvas.style.marginLeft = padding.left + "px";
    canvas.style.marginTop = padding.top + "px";

    if (ctx === null)
        ctx = setupWebGL(canvas);
    flexgl.ctx = ctx;
    flexgl.canvas = canvas;

    ctx._dict = options.env || options.dict || options.dictionary || {};


    var resources = new __WEBPACK_IMPORTED_MODULE_0__resource__["a" /* default */](ctx),
        framebuffers = new __WEBPACK_IMPORTED_MODULE_3__framebuffer__["a" /* default */](ctx),
        programManager = new __WEBPACK_IMPORTED_MODULE_1__program__["a" /* default */](ctx, resources),
        shaders = new __WEBPACK_IMPORTED_MODULE_2__shader__["a" /* default */](ctx, resources);

    var blendExt = ctx.getExtension("EXT_blend_minmax");
    if (blendExt) {
        ctx.MAX_EXT = blendExt.MAX_EXT;
        ctx.MIN_EXT = blendExt.MIN_EXT;
    }

    ctx.ext = ctx.getExtension("ANGLE_instanced_arrays");
    enableExtension([
        "OES_texture_float",
        "OES_texture_float_linear",
        // "OES_texture_half_float",
        // "OES_texture_half_float_linear"
    ]);

    if (container)
        container.appendChild(canvas);

    function setupWebGL(canvas) {
        var names = ["webgl", "experimental-webgl"];
        var gl = null;
        for (var i = 0; i < names.length; ++i) {
            try {
                gl = canvas.getContext(names[i], glAttr);
            } catch (e) {}
            if (gl) break;
        }
        return gl;
    }

    function enableExtension(extensions) {
        if (!Array.isArray(extensions)) extensions = [extensions];
        extensions.forEach(function(extension) {
            var extProps = ctx.getExtension(extension);
            if (extProps !== null) {
                Object.keys(extProps).forEach(function(ep) {
                    if (!ext.hasOwnProperty(ep)) {
                        ctx.ext[ep] = extProps[ep];
                    }
                })
            }
        });
    };

    flexgl.enableExtension = enableExtension;

    /**
     * Allocate Attributes in vertex buffer array stored in GPU memory
     * @param  {String} name attribute name
     * @param  {String} type attribute type: float, vec2, ...
     * @param  {Array} data data values
     * @return {Object}      FLexGL object
     */
    flexgl.attribute = function(name, type, data) {
        resources.allocate("attribute", name, type, data);
        Object.defineProperty(flexgl.attribute, name, {
            get: function() {
                return resources.attribute[name];
            },
            set: function(data) {
                resources.attribute[name].load(data);
            }
        });
        return flexgl;
    };
    flexgl.buffer = flexgl.attribute; //alias

    /**
     * Create a Uniform variable for WebGL shader programs
     * @param  {String} name attribute name
     * @param  {String} type uniform variable type: float, vec2, ...
     * @param  {Array} data data values
     * @return {Object}      FLexGL object
     */
    flexgl.uniform = function(name, type, data) {
        resources.allocate("uniform", name, type, data);
        if (!flexgl.uniform.hasOwnProperty(name)) {
            Object.defineProperty(flexgl.uniform, name, {
                get: function() {
                    return resources.uniform[name];
                },
                set: function(data) {
                    resources.uniform[name].load(data);
                    if (ctx.isProgram(program))
                        resources.uniform[name].link(program);
                }
            });
        }
        return flexgl;
    };

    flexgl.uniform.serialize = function(aoa) {
        var sa = [];
        aoa.forEach(function(a) {
            sa = sa.concat(a);
        })
        return sa;
    }

    /**
     * Create a Uniform variable for WebGL shader programs
     * @param  {String} name attribute name
     * @param  {String} type texture type: unsigned_byte or float, ...
     * @param  {Array} data data values
     * @param  {Array} dim [width, height]
     * @param  {String} [channel='alpha'] WebGL formats (rgba, alpha)
     * @param  {Object} [sampler=null] FLexGL Uniform Object
     * @return {Object}      FLexGL object
     */
    flexgl.texture = function(name, type, data, dim, channel, sampler) {
        resources.allocate("texture", name, type, dim, channel, data, sampler);
        Object.defineProperty(flexgl.texture, name, {
            get: function() {
                return resources.texture[name];
            },
            set: function(data) {
                resources.texture[name].load(data);
            }
        });
        return flexgl;
    }

    flexgl.texture.update = function(name, data, offset, dim) {
        resources.texture[name].update(data, offset, dim);
    }

    /**
     * Create a Uniform variable for WebGL shader programs
     * @param  {String} name attribute name
     * @param  {String} [type] Varying variable type: float, vec2, ...
     * @param  {Number} [size=1] data array
     * @return {Object}      FLexGL object
     */
    flexgl.varying = function(name, type, size) {
        resources.allocate("varying", name, type, size);
        return flexgl;
    };

    /**
     * Create a Uniform variable for WebGL shader programs
     * @param  {String} name attribute name
     * @param  {String} type attribute type: float, vec2, ...
     * @param  {Array} dim [width, height]
     * @param  {Object} [texture=null] FLexGL Texture Object
     * @return {Object}      FLexGL object
     */
    flexgl.framebuffer = function(name, type, dim, texture) {
        var texture = texture || resources.allocate('texture', name, type, dim, 'rgba', null);

        framebuffers.create(name, type, dim, texture);
        if (!flexgl.framebuffer.hasOwnProperty(name)) {
            Object.defineProperty(flexgl.framebuffer, name, {
                get: function() {
                    return framebuffers[name];
                }
            });
        }
        return flexgl;
    }

    flexgl.framebuffer.enableRead = function(name) {
        framebuffers[name].enableRead(program);
    }

    flexgl.bindFramebuffer = function(fbName) {
        if (fbName === null)
            ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
        else
            ctx.bindFramebuffer(ctx.FRAMEBUFFER, framebuffers[fbName].ptr);
    }

    flexgl.subroutine = function(name, type, fn) {
        resources.allocate("subroutine", name, type, fn);
        return flexgl;
    }

    flexgl.parameter = function(keyValuePairs) {
        Object.keys(keyValuePairs).forEach(function(key) {
            ctx._dict[key] = keyValuePairs[key];
            if (Array.isArray(ctx._dict[key])) {
                var i = 0;
                Object.defineProperty(ctx._dict, key, {
                    get: function() {
                        return keyValuePairs[key][i++];
                    },
                    set: function(newArray) {
                        i = 0;
                        ctx._dict[key] = newArray;
                    }
                });
            } else if(typeof(ctx._dict[key]) == 'object') {
                var dictKeys = Object.keys(ctx._dict[key]);
                fxgl.uniform('dict'+key, 'float', dictKeys.map(d=>ctx._dict[key][d]));
            }
        })
        return flexgl;
    }

    flexgl.dictionary = flexgl.parameter;

    flexgl.shader = programManager.shader;

    flexgl.program = function(name, vs, fs) {
        program = programManager.program(name, vs, fs);
        return ctx;
    }

    flexgl.createProgram = function(name, vs, fs) {
        program = programManager.create(name, vs, fs);
        return ctx;
    }

    flexgl.app = function(name, props) {
        var vs = flexgl.shader.vertex(props.vs),
            fs = flexgl.shader.fragment(props.fs),
            fb = props.framebuffer || null;

        flexgl.program(name, vs, fs);

        var draw = props.render || props.draw;

        return function(args) {
            var gl = flexgl.program(name);
            return draw.call(gl, args);
        }
    }

    flexgl.dimension = function() {
        return [canvas.width, canvas.height];
    }

    flexgl.resources = resources;

    return flexgl;
}


/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Resource;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__uniform__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__attribute__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__texture__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__varying__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__subroutine__ = __webpack_require__(10);






function Resource(glContext) {
    var resource = (this instanceof Resource) ? this : {},
        gpuResources = {};

    resource.uniform = new __WEBPACK_IMPORTED_MODULE_0__uniform__["a" /* default */](glContext);
    resource.attribute = new __WEBPACK_IMPORTED_MODULE_1__attribute__["a" /* default */](glContext);
    resource.texture = new __WEBPACK_IMPORTED_MODULE_2__texture__["a" /* default */](glContext);
    resource.varying = new __WEBPACK_IMPORTED_MODULE_3__varying__["a" /* default */](glContext);
    resource.subroutine = new __WEBPACK_IMPORTED_MODULE_4__subroutine__["a" /* default */]();

    var resourceTypes = ['uniform', 'attribute', 'texture', 'varying', 'subroutine'];

    resource.allocate = function(type, props) {
        if (resourceTypes.indexOf(type) === -1) {
            throw Error("Error: Invalid resource type: " + type);
        }
        var res = resource[type].create.apply(null, Array.prototype.slice.call(arguments, 1));
        res.resourceType = type;
        gpuResources[res.name] = res;
        if (!gpuResources.hasOwnProperty(res.name)) {
            Object.defineProperty(gpuResources, res.name, {
                get: function() {
                    return gpuResources[res.name];
                },
                set: function(data) {
                    gpuResources[res.name].load(data);
                }
            });
        }
        return res;
    };

    resource.link = function(program, resources) {
        var requiredResources = (Array.isArray(resources)) ? resources : Object.keys(gpuResources);
        requiredResources.forEach(function(resourceName) {
            if (gpuResources.hasOwnProperty(resourceName))
                gpuResources[resourceName].link(program);
        })
    };

    resource.get = function(name) {
        return gpuResources[name];
    }

    resource.create = resource.allocate;

    return resource;
};


/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Attribute;
function Attribute(glContext) {
    
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


/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Varying;
function Varying(glContext) {

    var varying = (this instanceof Varying) ? this : {},
        ctx = glContext;

    varying.create = function(name, type, size) {
        varying[name] = {
            name: name,
            type: type || 'float',
            size: size || 1,
        };

        varying[name].link = function() {};

        varying[name].header = function() {
            var header = 'varying ' + this.type + ' ' + this.name;
            if(this.size > 1)
                header += '[' + this.size + ']';
            return header + ';\n';
        }

        return varying[name];
    }

    return varying;
}


/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Subroutine;
function Subroutine() {

    var subroutine = (this instanceof Subroutine) ? this : {};

    subroutine.create = function(name, type, fn) {
        subroutine[name] = {
            name: name,
            type: type || 'float',
            fn: fn,
            resourceType: "subroutine"
        };

        subroutine[name].link = function(program) {
            return this;
        }

        subroutine[name].load = function(fn) {
            subroutine[name].fn = fn;
            return this;
        }

        subroutine[name].header = function() {
            return this.fn.toString();
        }

        return subroutine[name];
    };

    return subroutine;
}


/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Program;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shader__ = __webpack_require__(2);


function Program(glContext, resources) {

    var program,
        ctx = glContext,
        pm = {},
        kernels = {},
        shaders = new __WEBPACK_IMPORTED_MODULE_0__shader__["a" /* default */](glContext, resources);

    pm.create = function(name, vs, fs) {
        var name = name || "default",
            vs = vs || "default",
            fs = fs || "default",
            deps = [];

        if (kernels.hasOwnProperty(name)) {
            pm.delete(name);
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
            return null;
        }

        deps = deps.concat(kernels[name].vs.deps);
        deps = deps.concat(kernels[name].fs.deps);
        kernels[name].deps = deps;

        return kernels[name];
    }

    pm.use = pm.program = function(name, vs, fs) {
        if (kernels.hasOwnProperty(name)) {
            program = kernels[name];
            ctx.useProgram(program);
            resources.link(program, program.deps);
            return program;
        } else {
            return pm.create(name, vs, fs);
        }
    }

    pm.delete = function(name) {
        if (kernels.hasOwnProperty(name)) {
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
        var options = {
            type: "vertex"
        };
        if (fn.name) options.name = fn.name;
        return shaders.create(options, fn);
    }

    pm.shader.fragment = function(fn) {
        var options = {
            type: "fragment"
        };
        if (fn.name) options.name = fn.name;
        return shaders.create(options, fn);
    }

    return pm;
}


/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Framebuffer;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__texture__ = __webpack_require__(1);


function Framebuffer(glContext) {

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
            renderbuffer: ctx.createRenderbuffer(),
        }

        if (framebuffer[name].texture === null) {
            var buf = (type == 'float') ?
                new Float32Array(dim[0] * dim[1] * 4) :
                new Uint8Array(dim[0] * dim[1] * 4);
            framebuffer[name].texture = Object(__WEBPACK_IMPORTED_MODULE_0__texture__["a" /* default */])(ctx).create(name, type, dim, "rgba", buf);
        }

        var renderbuffer = framebuffer[name].renderbuffer;
        ctx.bindFramebuffer(ctx.FRAMEBUFFER, framebuffer[name].ptr);
        ctx.bindRenderbuffer(ctx.RENDERBUFFER, renderbuffer);
        ctx.renderbufferStorage(
            ctx.RENDERBUFFER,
            ctx.DEPTH_COMPONENT16,
            framebuffer[name].width,
            framebuffer[name].height
        );
        ctx.framebufferTexture2D(
            ctx.FRAMEBUFFER,
            ctx.COLOR_ATTACHMENT0,
            ctx.TEXTURE_2D,
            framebuffer[name].texture.ptr,
            0
        );
        ctx.framebufferRenderbuffer(
            ctx.FRAMEBUFFER,
            ctx.DEPTH_ATTACHMENT,
            ctx.RENDERBUFFER,
            renderbuffer
        );
        ctx.bindRenderbuffer(ctx.RENDERBUFFER, null);
        ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);

        framebuffer[name].enableRead = function(program) {
            ctx.activeTexture(ctx.TEXTURE0 + this.texture.index);
            ctx.bindTexture(ctx.TEXTURE_2D, this.texture.ptr);
            this.texture.location = ctx.getUniformLocation(program, this.texture.name);
            ctx.uniform1i(this.texture.location, this.texture.index);
        };

        framebuffer[name].delete = function() {
            ctx.bindRenderbuffer(gl.RENDERBUFFER, null);
            ctx.bindFramebuffer(gl.FRAMEBUFFER, null);
            ctx.deleteRenderbuffer(this.renderbuffer);
            ctx.deleteTexture(this.texture.ptr)
            ctx.deleteFramebuffer(this.ptr);
        };

        return framebuffer[name];
    }

    return framebuffer;
}


/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZjY1Y2EwMzVhMmYxZGNkZjJjN2MiLCJ3ZWJwYWNrOi8vLy4vc3JjL3VuaWZvcm0uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RleHR1cmUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NoYWRlci5qcyIsIndlYnBhY2s6Ly8vLi9pbmRleC5qcyIsIndlYnBhY2s6Ly8vKHdlYnBhY2spL2J1aWxkaW4vZ2xvYmFsLmpzIiwid2VicGFjazovLy8od2VicGFjaykvYnVpbGRpbi9oYXJtb255LW1vZHVsZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvbWFpbi5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcmVzb3VyY2UuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2F0dHJpYnV0ZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdmFyeWluZy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvc3Vicm91dGluZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcHJvZ3JhbS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZnJhbWVidWZmZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7QUM3REE7O0FBRUEsdURBQXVEO0FBQ3ZEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG1EQUFtRCx5QkFBeUI7QUFDNUU7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsbURBQW1ELHlCQUF5QjtBQUM1RTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QjtBQUM5Qjs7QUFFQTtBQUNBOzs7QUFHQTtBQUNBOzs7Ozs7Ozs7O0FDaEdBOztBQUVBOztBQUVBLHVEQUF1RDtBQUN2RDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLG9FQUFvRTtBQUNwRTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7QUNwSUE7O0FBRUEscURBQXFEO0FBQ3JEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDO0FBQzNDOztBQUVBO0FBQ0EsOERBQThELE1BQU07QUFDcEUsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTs7QUFFWjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBOztBQUVBO0FBQ0EsOEJBQThCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSwrREFBK0Q7O0FBRS9EOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7O0FBRXJCO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQixhQUFhO0FBQ2I7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7OztBQ25PQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQSxnRjs7Ozs7OztBQ1hBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSw0Q0FBNEM7O0FBRTVDOzs7Ozs7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxxREFBcUQ7QUFDckQsMkJBQTJCO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLG9CQUFvQjtBQUNwQjtBQUNBLHlDQUF5QztBQUN6Qzs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7OztBQUdBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsa0JBQWtCO0FBQ3pDO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0EsU0FBUztBQUNUOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxnQkFBZ0IsT0FBTztBQUN2QixnQkFBZ0IsT0FBTztBQUN2QixnQkFBZ0IsTUFBTTtBQUN0QixnQkFBZ0IsT0FBTztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxxQ0FBcUM7O0FBRXJDO0FBQ0E7QUFDQSxnQkFBZ0IsT0FBTztBQUN2QixnQkFBZ0IsT0FBTztBQUN2QixnQkFBZ0IsTUFBTTtBQUN0QixnQkFBZ0IsT0FBTztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQSxnQkFBZ0IsT0FBTztBQUN2QixnQkFBZ0IsT0FBTztBQUN2QixnQkFBZ0IsTUFBTTtBQUN0QixnQkFBZ0IsTUFBTTtBQUN0QixnQkFBZ0IsT0FBTztBQUN2QixnQkFBZ0IsT0FBTztBQUN2QixnQkFBZ0IsT0FBTztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxnQkFBZ0IsT0FBTztBQUN2QixnQkFBZ0IsT0FBTztBQUN2QixnQkFBZ0IsT0FBTztBQUN2QixnQkFBZ0IsT0FBTztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxnQkFBZ0IsT0FBTztBQUN2QixnQkFBZ0IsT0FBTztBQUN2QixnQkFBZ0IsTUFBTTtBQUN0QixnQkFBZ0IsT0FBTztBQUN2QixnQkFBZ0IsT0FBTztBQUN2QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakIsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7O0FDalNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx5REFBeUQ7QUFDekQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7Ozs7Ozs7O0FDckRBOztBQUVBLDJEQUEyRDtBQUMzRDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxrRUFBa0U7QUFDbEU7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7O0FDbkRBOztBQUVBLHVEQUF1RDtBQUN2RDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBOEI7QUFDOUI7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7QUN6QkE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7QUM3QkE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLGVBQWU7QUFDZixvQkFBb0I7QUFDcEI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7O0FDdEZBOztBQUVBOztBQUVBLCtEQUErRDtBQUMvRDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBIiwiZmlsZSI6ImZsZXhnbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDMpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIGY2NWNhMDM1YTJmMWRjZGYyYzdjIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gVW5pZm9ybShnbENvbnRleHQsIG5hbWUsIHR5cGUsIGRhdGEpIHtcblxuICAgIHZhciB1bmlmb3JtID0gKHRoaXMgaW5zdGFuY2VvZiBVbmlmb3JtKSA/IHRoaXMgOiB7fSxcbiAgICAgICAgY3R4ID0gZ2xDb250ZXh0O1xuXG4gICAgZnVuY3Rpb24gc2VyaWFsaXplQXJyYXkoYXJyYXlPZkFycmF5KSB7XG4gICAgICAgIHZhciBzYSA9IFtdO1xuICAgICAgICBhcnJheU9mQXJyYXkuZm9yRWFjaChmdW5jdGlvbihhKXtcbiAgICAgICAgICAgIHNhID0gc2EuY29uY2F0KGEpO1xuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gc2E7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0VW5pZm9ybSgpIHtcbiAgICAgICAgdmFyIHR5cGUgPSB0aGlzLnR5cGUsXG4gICAgICAgICAgICBsb2NhdGlvbiA9IHRoaXMubG9jYXRpb24sXG4gICAgICAgICAgICBzaXplID0gdGhpcy5zaXplLFxuICAgICAgICAgICAgZGF0YSA9IHRoaXMuZGF0YTtcblxuICAgICAgICBpZihBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICB2YXIgaGFzQXJyYXkgPSBkYXRhLmZpbHRlcihmdW5jdGlvbihkKXtyZXR1cm4gQXJyYXkuaXNBcnJheShkKTt9KTtcbiAgICAgICAgICAgIGlmKGhhc0FycmF5KVxuICAgICAgICAgICAgICAgIGRhdGEgPSBzZXJpYWxpemVBcnJheShkYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCh0eXBlID09ICdmbG9hdCcgfHwgdHlwZSA9PSAnaW50JykgJiYgIUFycmF5LmlzQXJyYXkoZGF0YSkgJiYgIUFycmF5QnVmZmVyLmlzVmlldyhkYXRhKSlcbiAgICAgICAgICAgIGRhdGEgPSBbZGF0YV07XG5cbiAgICAgICAgdmFyIGJ1ZjtcbiAgICAgICAgaWYgKHR5cGUuc2xpY2UoMCwzKSA9PSAndmVjJyB8fCB0eXBlID09ICdmbG9hdCcpIHtcbiAgICAgICAgICAgIGJ1ZiA9IG5ldyBGbG9hdDMyQXJyYXkoZGF0YSk7XG4gICAgICAgICAgICBjdHhbJ3VuaWZvcm0nICsgc2l6ZSArICdmdiddKGxvY2F0aW9uLCBidWYpO1xuICAgICAgICB9IGVsc2UgaWYodHlwZS5zbGljZSgwLDQpID09ICdpdmVjJyB8fCB0eXBlID09ICdpbnQnKXtcbiAgICAgICAgICAgIGJ1ZiA9IG5ldyBJbnQzMkFycmF5KGRhdGEpO1xuICAgICAgICAgICAgY3R4Wyd1bmlmb3JtJyArIHNpemUgKyAnaXYnXShsb2NhdGlvbiwgYnVmKTtcbiAgICAgICAgfSBlbHNlIGlmKHR5cGUuc2xpY2UoMCwzKSA9PSAnbWF0Jykge1xuICAgICAgICAgICAgYnVmID0gbmV3IEZsb2F0MzJBcnJheShkYXRhKTtcbiAgICAgICAgICAgIGN0eFsndW5pZm9ybU1hdHJpeCcgKyBzaXplICsgJ2Z2J10obG9jYXRpb24sIGZhbHNlLCBidWYpO1xuICAgICAgICB9IGVsc2UgaWYodHlwZSA9PSAnc2FtcGxlcjJEJykge1xuICAgICAgICAgICAgaWYoZGF0YS5oYXNPd25Qcm9wZXJ0eSgncmVzb3VyY2VUeXBlJykgJiYgZGF0YS5yZXNvdXJjZVR5cGUgPT0gJ3RleHR1cmUnKSB7XG4gICAgICAgICAgICAgICAgY3R4LmFjdGl2ZVRleHR1cmUoY3R4LlRFWFRVUkUwICsgZGF0YS5pbmRleCk7XG4gICAgICAgICAgICAgICAgY3R4LmJpbmRUZXh0dXJlKGN0eC5URVhUVVJFXzJELCBkYXRhLnB0cik7XG4gICAgICAgICAgICAgICAgY3R4LnVuaWZvcm0xaShsb2NhdGlvbiwgZGF0YS5pbmRleCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1bmlmb3JtLmNyZWF0ZSA9IGZ1bmN0aW9uKG5hbWUsIHR5cGUsIGRhdGEpIHtcblxuICAgICAgICBpZihBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICB2YXIgaGFzQXJyYXkgPSBkYXRhLmZpbHRlcihmdW5jdGlvbihkKXtyZXR1cm4gQXJyYXkuaXNBcnJheShkKTt9KTtcbiAgICAgICAgICAgIGlmKGhhc0FycmF5KVxuICAgICAgICAgICAgICAgIGRhdGEgPSBzZXJpYWxpemVBcnJheShkYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHVuaWZvcm1bbmFtZV0gPSB7XG4gICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICBsb2NhdGlvbjogbnVsbCxcbiAgICAgICAgICAgIHNpemU6IHBhcnNlSW50KHR5cGUuc2xpY2UoMyw0KSkgfHwgcGFyc2VJbnQodHlwZS5zbGljZSg0LDUpKSB8fCAxXG4gICAgICAgIH07XG5cbiAgICAgICAgdW5pZm9ybVtuYW1lXS5saW5rID0gZnVuY3Rpb24ocHJvZ3JhbSkge1xuICAgICAgICAgICAgaWYodHlwZW9mIHRoaXMuZGF0YSAhPT0gJ3VuZGVmaW5lZCcgJiYgdGhpcy5kYXRhICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2NhdGlvbiA9IGN0eC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgdGhpcy5uYW1lKTtcbiAgICAgICAgICAgICAgICBzZXRVbmlmb3JtLmNhbGwodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfTtcblxuICAgICAgICB1bmlmb3JtW25hbWVdLmxvYWQgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG5cbiAgICAgICAgdW5pZm9ybVtuYW1lXS5oZWFkZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBoZWFkZXIgPSAndW5pZm9ybSAnICsgdGhpcy50eXBlICsgJyAnICsgdGhpcy5uYW1lLFxuICAgICAgICAgICAgICAgIGxlbiA9IDA7XG5cbiAgICAgICAgICAgIGlmKHRoaXMudHlwZSAhPSAnc2FtcGxlcjJEJykge1xuICAgICAgICAgICAgICAgIGxlbiA9IHRoaXMuZGF0YS5sZW5ndGggLyB0aGlzLnNpemU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vVE9ETzogZml4IGRlY2xhcmF0aW9uIGZvciBtYXRyaXhcbiAgICAgICAgICAgIGlmKGxlbiA+IDEgJiYgdHlwZSAhPSAnbWF0NCcpIHtcbiAgICAgICAgICAgICAgICBoZWFkZXIgKz0gJ1snICsgbGVuICsgJ10nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGhlYWRlciArICc7XFxuJztcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gdW5pZm9ybVtuYW1lXTtcbiAgICB9XG5cblxuICAgIHJldHVybiB1bmlmb3JtO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvdW5pZm9ybS5qc1xuLy8gbW9kdWxlIGlkID0gMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSIsImltcG9ydCBVbmlmb3JtIGZyb20gXCIuL3VuaWZvcm1cIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gVGV4dHVyZShnbENvbnRleHQpIHtcblxuICAgIHZhciB0ZXh0dXJlID0gKHRoaXMgaW5zdGFuY2VvZiBUZXh0dXJlKSA/IHRoaXMgOiB7fSxcbiAgICAgICAgY3R4ID0gZ2xDb250ZXh0LFxuICAgICAgICB0ZXh0dXJlSUQgPSAwO1xuXG4gICAgZnVuY3Rpb24gc2V0VGV4dHVyZShuYW1lLCB0ZXhEYXRhKSB7XG4gICAgICAgIHZhciB0eXBlID0gY3R4W3RleHR1cmVbbmFtZV0udHlwZS50b1VwcGVyQ2FzZSgpXSxcbiAgICAgICAgICAgIGZvcm1hdCA9IGN0eFt0ZXh0dXJlW25hbWVdLmNoYW5uZWwudG9VcHBlckNhc2UoKV0sXG4gICAgICAgICAgICB3aWR0aCA9IHRleHR1cmVbbmFtZV0uZGltWzBdLFxuICAgICAgICAgICAgaGVpZ2h0ID0gdGV4dHVyZVtuYW1lXS5kaW1bMV07XG5cbiAgICAgICAgdGV4dHVyZVtuYW1lXS5kYXRhID0gdGV4RGF0YTtcblxuICAgICAgICBjdHguYmluZFRleHR1cmUoY3R4LlRFWFRVUkVfMkQsIHRleHR1cmVbbmFtZV0ucHRyKTtcbiAgICAgICAgY3R4LnRleEltYWdlMkQoY3R4LlRFWFRVUkVfMkQsIDAsIGZvcm1hdCwgd2lkdGgsIGhlaWdodCwgMCwgZm9ybWF0LCB0eXBlLCB0ZXhEYXRhKTtcbiAgICAgICAgY3R4LnRleFBhcmFtZXRlcmkoY3R4LlRFWFRVUkVfMkQsIGN0eC5URVhUVVJFX01JTl9GSUxURVIsIGN0eC5ORUFSRVNUKTtcbiAgICAgICAgY3R4LnRleFBhcmFtZXRlcmkoY3R4LlRFWFRVUkVfMkQsIGN0eC5URVhUVVJFX01BR19GSUxURVIsIGN0eC5ORUFSRVNUKTtcbiAgICAgICAgY3R4LnRleFBhcmFtZXRlcmkoY3R4LlRFWFRVUkVfMkQsIGN0eC5URVhUVVJFX1dSQVBfUywgY3R4LkNMQU1QX1RPX0VER0UpO1xuICAgICAgICBjdHgudGV4UGFyYW1ldGVyaShjdHguVEVYVFVSRV8yRCwgY3R4LlRFWFRVUkVfV1JBUF9ULCBjdHguQ0xBTVBfVE9fRURHRSk7XG4gICAgICAgIGN0eC5iaW5kVGV4dHVyZShjdHguVEVYVFVSRV8yRCwgbnVsbCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlVGV4dHVyZShuYW1lLCB0ZXhEYXRhLCBvZmZzZXQsIGRpbSkge1xuICAgICAgICB2YXIgdHlwZSA9IGN0eFt0ZXh0dXJlW25hbWVdLnR5cGUudG9VcHBlckNhc2UoKV0sXG4gICAgICAgICAgICBmb3JtYXQgPSBjdHhbdGV4dHVyZVtuYW1lXS5jaGFubmVsLnRvVXBwZXJDYXNlKCldLFxuICAgICAgICAgICAgd2lkdGggPSBkaW1bMF0gfHwgdGV4dHVyZVtuYW1lXS5kaW1bMF0sXG4gICAgICAgICAgICBoZWlnaHQgPSBkaW1bMV0gfHwgdGV4dHVyZVtuYW1lXS5kaW1bMV07XG5cbiAgICAgICAgY3R4LmJpbmRUZXh0dXJlKGN0eC5URVhUVVJFXzJELCB0ZXh0dXJlW25hbWVdLnB0cik7XG4gICAgICAgIGN0eC50ZXhTdWJJbWFnZTJEKGN0eC5URVhUVVJFXzJELCAwLCBvZmZzZXRbMF0sIG9mZnNldFsxXSwgd2lkdGgsIGhlaWdodCwgZm9ybWF0LCB0eXBlLCB0ZXhEYXRhKTtcbiAgICAgICAgY3R4LmJpbmRUZXh0dXJlKGN0eC5URVhUVVJFXzJELCBudWxsKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBBZGQgc3VwcG9ydCBmb3IgdGV4dHVyZSBjb21wcmVzc2lvblxuICAgIC8vIGZ1bmN0aW9uIGNvbXByZXNzVGV4dHVyZSh0ZXhEYXRhKSB7XG4gICAgLy9cbiAgICAvLyAgICAgdmFyIGV4dCA9IChcbiAgICAvLyAgICAgICBjdHguZ2V0RXh0ZW5zaW9uKFwiV0VCR0xfY29tcHJlc3NlZF90ZXh0dXJlX3MzdGNcIikgfHxcbiAgICAvLyAgICAgICBjdHguZ2V0RXh0ZW5zaW9uKFwiTU9aX1dFQkdMX2NvbXByZXNzZWRfdGV4dHVyZV9zM3RjXCIpIHx8XG4gICAgLy8gICAgICAgY3R4LmdldEV4dGVuc2lvbihcIldFQktJVF9XRUJHTF9jb21wcmVzc2VkX3RleHR1cmVfczN0Y1wiKVxuICAgIC8vICAgICApO1xuICAgIC8vXG4gICAgLy8gICAgIGN0eC5jb21wcmVzc2VkVGV4SW1hZ2UyRChjdHguVEVYVFVSRV8yRCwgMCwgZXh0LkNPTVBSRVNTRURfUkdCQV9TM1RDX0RYVDNfRVhULCB0ZXh0dXJlW25hbWVdLmRpbVswXSwgdGV4dHVyZVtuYW1lXS5kaW1bMV0sIDAsIHRleERhdGEpO1xuICAgIC8vICAgICBjdHgudGV4UGFyYW1ldGVyaShjdHguVEVYVFVSRV8yRCwgY3R4LlRFWFRVUkVfTUFHX0ZJTFRFUiwgY3R4LkxJTkVBUik7XG4gICAgLy8gICAgIGN0eC50ZXhQYXJhbWV0ZXJpKGN0eC5URVhUVVJFXzJELCBjdHguVEVYVFVSRV9NSU5fRklMVEVSLCBjdHguTElORUFSKTtcbiAgICAvLyB9XG5cbiAgICB0ZXh0dXJlLmNyZWF0ZSA9IGZ1bmN0aW9uKG5hbWUsIHR5cGUsIGRpbSwgY2hhbm5lbCwgZGF0YSwgc2FtcGxlcikge1xuICAgICAgICB2YXIgdGV4SW5kZXggPSAodGV4dHVyZS5oYXNPd25Qcm9wZXJ0eShuYW1lKSkgPyB0ZXh0dXJlW25hbWVdLmluZGV4IDogdGV4dHVyZUlEKys7XG4gICAgICAgIHRleHR1cmVbbmFtZV0gPSB7XG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgaW5kZXg6IHRleEluZGV4LFxuICAgICAgICAgICAgdHlwZTogdHlwZSB8fCBcImZsb2F0XCIsXG4gICAgICAgICAgICBkaW06IGRpbSB8fCBbNTEyLCA1MTJdLFxuICAgICAgICAgICAgY2hhbm5lbDogY2hhbm5lbCB8fCBcImFscGhhXCIsXG4gICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgbG9jYXRpb246IG51bGwsXG4gICAgICAgICAgICBzYW1wbGVyOiBzYW1wbGVyIHx8IG51bGwsXG4gICAgICAgICAgICBwdHI6IGN0eC5jcmVhdGVUZXh0dXJlKClcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBpZihkYXRhICE9PSBudWxsICYmIGRhdGEubGVuZ3RoKVxuICAgICAgICBzZXRUZXh0dXJlKG5hbWUsIGRhdGEpO1xuXG4gICAgICAgIGlmICh0ZXh0dXJlW25hbWVdLnNhbXBsZXIgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRleHR1cmVbbmFtZV0uc2FtcGxlciA9IFVuaWZvcm0oY3R4KS5jcmVhdGUobmFtZSwgJ3NhbXBsZXIyRCcsIHRleHR1cmVbbmFtZV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGV4dHVyZVtuYW1lXS5zYW1wbGVyLmRhdGEgPSB0ZXh0dXJlW25hbWVdO1xuICAgICAgICB9XG5cbiAgICAgICAgdGV4dHVyZVtuYW1lXS5saW5rID0gZnVuY3Rpb24ocHJvZ3JhbSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZGF0YSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vIGN0eC5hY3RpdmVUZXh0dXJlKGN0eC5URVhUVVJFMCArIHRoaXMuaW5kZXgpO1xuICAgICAgICAgICAgICAgIC8vIGN0eC5iaW5kVGV4dHVyZShjdHguVEVYVFVSRV8yRCwgdGhpcy5wdHIpO1xuICAgICAgICAgICAgICAgIC8vIHRoaXMubG9jYXRpb24gPSBjdHguZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sIHRoaXMubmFtZSk7XG4gICAgICAgICAgICAgICAgLy8gY3R4LnVuaWZvcm0xaSh0aGlzLmxvY2F0aW9uLCB0aGlzLmluZGV4KTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mKHRoaXMuc2FtcGxlci5kYXRhKSA9PSAndW5kZWZpbmVkJyB8fCB0aGlzLnNhbXBsZXIuZGF0YSA9PT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zYW1wbGVyLmRhdGEgPSB0ZXh0dXJlW25hbWVdO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zYW1wbGVyLmxpbmsocHJvZ3JhbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHRleHR1cmVbbmFtZV0ubG9hZCA9IGZ1bmN0aW9uKHRleERhdGEpIHtcbiAgICAgICAgICAgIHNldFRleHR1cmUodGhpcy5uYW1lLCB0ZXhEYXRhKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgdGV4dHVyZVtuYW1lXS5jb3B5RnJvbUZCTyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY3R4LmJpbmRUZXh0dXJlKGN0eC5URVhUVVJFXzJELCB0aGlzLnB0cik7XG4gICAgICAgICAgICBjdHguY29weVRleEltYWdlMkQoXG4gICAgICAgICAgICAgICAgY3R4LlRFWFRVUkVfMkQsXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBjdHguUkdCQSxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgdGhpcy5kaW1bMF0sXG4gICAgICAgICAgICAgICAgdGhpcy5kaW1bMV0sXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGN0eC5iaW5kVGV4dHVyZShjdHguVEVYVFVSRV8yRCwgbnVsbCk7XG4gICAgICAgIH1cblxuICAgICAgICB0ZXh0dXJlW25hbWVdLnVwZGF0ZSA9IGZ1bmN0aW9uKHRleERhdGEsIG9mZnNldCwgZGltKSB7XG4gICAgICAgICAgICB1cGRhdGVUZXh0dXJlKHRoaXMubmFtZSwgdGV4RGF0YSwgb2Zmc2V0LCBkaW0pO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICB0ZXh0dXJlW25hbWVdLnJlc2l6ZSA9IGZ1bmN0aW9uKGRpbSwgZGF0YSkge1xuICAgICAgICAgICAgdGhpcy5kaW0gPSBkaW07XG4gICAgICAgICAgICBzZXRUZXh0dXJlKHRoaXMubmFtZSwgZGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICB0ZXh0dXJlW25hbWVdLmRlbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZ2xDb250ZXh0LmRlbGV0ZVRleHR1cmUodGhpcy5wdHIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGV4dHVyZVtuYW1lXS5oZWFkZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm5hbWUgPT0gdGhpcy5zYW1wbGVyLm5hbWUpXG4gICAgICAgICAgICAgICAgcmV0dXJuICd1bmlmb3JtIHNhbXBsZXIyRCAnICsgdGhpcy5zYW1wbGVyLm5hbWUgKyAnO1xcbic7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRleHR1cmVbbmFtZV07XG4gICAgfVxuXG4gICAgcmV0dXJuIHRleHR1cmU7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy90ZXh0dXJlLmpzXG4vLyBtb2R1bGUgaWQgPSAxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU2hhZGVyKGdsQ29udGV4dCwgZ2xSZXNvdXJjZSkge1xuICAgIFxuICAgIHZhciBzaGFkZXIgPSAodGhpcyBpbnN0YW5jZW9mIFNoYWRlcikgPyB0aGlzIDoge30sXG4gICAgICAgIGN0eCA9IGdsQ29udGV4dCxcbiAgICAgICAgcmVzb3VyY2UgPSBnbFJlc291cmNlLFxuICAgICAgICBwYXJhbWV0ZXJzID0gY3R4Ll9kaWN0IHx8IHt9O1xuXG4gICAgc2hhZGVyLnZlcnRleCA9IHt9O1xuICAgIHNoYWRlci5mcmFnbWVudCA9IHt9O1xuXG4gICAgdmFyIHNoYWRlclR5cGUgPSB7XG4gICAgICAgIHZlcnRleDogY3R4LlZFUlRFWF9TSEFERVIsXG4gICAgICAgIGZyYWdtZW50OiBjdHguRlJBR01FTlRfU0hBREVSXG4gICAgfTtcblxuICAgIC8vIENvbnZlcnQgSlMgZnVuY3Rpb25zIHRvIEdMU0wgY29kZXNcbiAgICBmdW5jdGlvbiB0b0dMU0wocmV0dXJuVHlwZSwgbmFtZSwgZm4pe1xuXG4gICAgICAgIHZhciBnbHNsID0gcmV0dXJuVHlwZSArICcgJyArXG4gICAgICAgICAgICBuYW1lICsgJygnICsgYXBwbHlFbnZQYXJhbWV0ZXJzKGZuLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAucmVwbGFjZShcbiAgICAgICAgICAgICAgICAvdmFyXFxzKyhbXFx3fFxcZF0rKVxccyo9XFxzKm5ld1xccysoW1xcd3xcXGRdKylcXCgoLiopXFwpL2csXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZXhwciwgbmFtZSwgZHR5cGUsIHZhbHVlKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcnRzO1xuICAgICAgICAgICAgICAgICAgICBpZih2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRzID0gW2R0eXBlLnRvTG93ZXJDYXNlKCksIG5hbWUsICc9JywgdmFsdWVdO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0cyA9IFtkdHlwZS50b0xvd2VyQ2FzZSgpLCBuYW1lXTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFydHMuam9pbignICcpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLnJlcGxhY2UoL2ZvclxccypcXChcXHMqdmFyXFxzKy9nLCAnZm9yKGludCAnKVxuICAgICAgICAgICAgLnJlcGxhY2UoL3Zhclxccy9nLCAnZmxvYXQgJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC90aGlzLi9nLCAnJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXCQoLiopXFwoKC4qKVxcKVxccyooPXw7KS9nLCBcIiQxICQyICQzXCIpO1xuICAgICAgICAgICAgLy8gLnJlcGxhY2UoL1xcJCguKj8pXFwuL2csIFwiJDEgXCIpXG5cbiAgICAgICAgaWYobmFtZSA9PSBcIm1haW5cIikge1xuICAgICAgICAgICAgZ2xzbCA9IGdsc2wucmVwbGFjZSgvZnVuY3Rpb24uKlxcKFxccyooW1xcc1xcU10qPylcXHMqey8sICcpeycpICsgXCJcXG5cIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gZ2xzbC5tYXRjaCgvZnVuY3Rpb24uKlxcKFxccyooW1xcc1xcU10qPylcXHMqXFwpLylbMV07XG5cbiAgICAgICAgICAgIGlmKGFyZ3MgIT0gXCJcIikge1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmdzLnJlcGxhY2UoL1xcJChbXFx3fFxcZF0rKV8vZywgXCIkMSBcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnbHNsID0gZ2xzbFxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9mdW5jdGlvbi4qXFwoXFxzKihbXFxzXFxTXSo/KVxccypcXCkvLCBhcmdzKycpJykgKyBcIlxcblwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBnbHNsO1xuICAgIH1cblxuICAgIC8vc2V0IHBhcmFtZXRlcnMgaW4gSlMgZnVuY3Rpb25zIGJlZm9yZSBjb252ZXJ0aW5nIHRvIEdMU0wgY29kZXNcbiAgICBmdW5jdGlvbiBhcHBseUVudlBhcmFtZXRlcnMoc3RyKXtcbiAgICAgICAgLy9maW5kIGFsbCAkKC4uLikgYW5kIHJlcGxhY2UgdGhlbSB3aXRoIHBhcmFtZXRlcnNcbiAgICAgICAgdmFyIGVudlBhcmFtID0gT2JqZWN0LmtleXMocGFyYW1ldGVycyk7XG4gICAgICAgIGlmKGVudlBhcmFtLmxlbmd0aCA+IDApe1xuICAgICAgICAgICAgdmFyIHJlID0gbmV3IFJlZ0V4cChcIlxcXFwkXFxcXCgoXCIrZW52UGFyYW0uam9pbihcInxcIikrXCIpXFxcXClcIixcImdcIik7XG4gICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZShyZSwgZnVuY3Rpb24obWF0Y2hlZCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcmFtZXRlcnNbbWF0Y2hlZC5zbGljZSgyLG1hdGNoZWQubGVuZ3RoLTEpXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTWFrZSB1bmlmb3JtcyB0byBiZSB1c2VkIGFzIHBhcmFtZXRlcnMgaW4gc2hhZGVycywgbGlrZSAkKHVuaWZvcm1OYW1lKVxuICAgICAgICAvLyB2YXIgZW52VW5pZm9ybXMgPSBPYmplY3Qua2V5cyhyZXNvdXJjZS51bmlmb3JtKTtcbiAgICAgICAgLy8gcmUgPSBuZXcgUmVnRXhwKFwiXFxcXCRcXFxcKChcIitlbnZVbmlmb3Jtcy5qb2luKFwifFwiKStcIilcXFxcKVwiLFwiZ1wiKTtcbiAgICAgICAgLy8gc3RyID0gc3RyLnJlcGxhY2UocmUsIGZ1bmN0aW9uKG1hdGNoZWQpe1xuICAgICAgICAvLyAgICAgcmV0dXJuIHJlc291cmNlLnVuaWZvcm1bbWF0Y2hlZC5zbGljZSgyLG1hdGNoZWQubGVuZ3RoLTEpXS5kYXRhO1xuICAgICAgICAvLyB9KTtcblxuICAgICAgICByZXR1cm4gc3RyO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbXBpbGUoc2hhZGVyVHlwZSwgc2hhZGVyU291cmNlKSB7XG4gICAgICAgIGlmIChzaGFkZXJUeXBlICE9PSBjdHguVkVSVEVYX1NIQURFUiAmJiBzaGFkZXJUeXBlICE9PSBjdHguRlJBR01FTlRfU0hBREVSKSB7XG4gICAgICAgICAgICB0aHJvdyAoXCJFcnJvcjogdW5rbm93biBzaGFkZXIgdHlwZVwiKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgX3NoYWRlciA9IGN0eC5jcmVhdGVTaGFkZXIoc2hhZGVyVHlwZSk7XG4gICAgICAgIGN0eC5zaGFkZXJTb3VyY2UoX3NoYWRlciwgc2hhZGVyU291cmNlKTtcbiAgICAgICAgY3R4LmNvbXBpbGVTaGFkZXIoX3NoYWRlcik7XG5cbiAgICAgICAgLy8gQ2hlY2sgdGhlIGNvbXBpbGUgc3RhdHVzLCBnZXQgY29tcGlsZSBlcnJvciBpZiBhbnlcbiAgICAgICAgdmFyIGNvbXBpbGVkID0gY3R4LmdldFNoYWRlclBhcmFtZXRlcihfc2hhZGVyLCBjdHguQ09NUElMRV9TVEFUVVMpO1xuICAgICAgICBpZiAoIWNvbXBpbGVkKSB7XG4gICAgICAgICAgICB2YXIgbGFzdEVycm9yID0gY3R4LmdldFNoYWRlckluZm9Mb2coX3NoYWRlcik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzaGFkZXJTb3VyY2UgKyAnXFxuID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0nKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVycm9yIGNvbXBpbGluZyBzaGFkZXIgJ1wiICsgX3NoYWRlciArIFwiJzpcIiArIGxhc3RFcnJvcik7XG5cbiAgICAgICAgICAgIGN0eC5kZWxldGVTaGFkZXIoX3NoYWRlcik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBfc2hhZGVyO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldERlcHMoZm4pIHtcbiAgICAgICAgdmFyIGRlcHMgPSBbXSxcbiAgICAgICAgICAgIHNvdXJjZUNvZGUgPSBmbi50b1N0cmluZygpLFxuICAgICAgICAgICAgc2hhZGVyQXJncyA9IHNvdXJjZUNvZGUubWF0Y2goL2Z1bmN0aW9uXFxzLio/XFwoKFteKV0qKVxcKS8pLFxuICAgICAgICAgICAgYXJncyA9IChzaGFkZXJBcmdzICE9PSBudWxsICYmIHNoYWRlckFyZ3MubGVuZ3RoKSA/IHNoYWRlckFyZ3NbMV0gOiBbXTtcbiAgICAgICAgLy8gYXJncyA9IGFyZ3MucmVwbGFjZSgvKD86XFxyXFxufFxccnxcXG58XFxzKS9nLCAnJyk7XG4gICAgICAgIC8vXG4gICAgICAgIGlmKGFyZ3MubGVuZ3RoKSB7XG4gICAgICAgICAgICBkZXBzID0gYXJncy5zcGxpdCgnLCcpLm1hcChmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJnLnJlcGxhY2UoL1xcL1xcKi4qXFwqXFwvLywgJycpLnRyaW0oKTtcbiAgICAgICAgICAgIH0pLmZpbHRlcihmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJnO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZXh0cmFEZXBzID0gZ2V0RXh0cmFEZXBzKHNvdXJjZUNvZGUpO1xuICAgICAgICBpZihleHRyYURlcHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBkZXBzID0gZGVwcy5jb25jYXQoZXh0cmFEZXBzXG4gICAgICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uKGQpe1xuICAgICAgICAgICAgICAgIHJldHVybiBkZXBzLmluZGV4T2YoZCkgPT09IC0xO1xuICAgICAgICAgICAgfSkpXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGVwcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRFeHRyYURlcHMoZm5TdHJpbmcpIHtcbiAgICAgICAgdmFyIGV4dHJhRGVwcyA9IGZuU3RyaW5nLm1hdGNoKC90aGlzXFwuKFxcdyspL2cpO1xuICAgICAgICBpZihleHRyYURlcHMgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGV4dHJhRGVwcyA9IGV4dHJhRGVwcy5tYXAoZnVuY3Rpb24oZCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGQuc2xpY2UoNSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZXh0cmFEZXBzIHx8IFtdO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRlY2xhcmVEZXAoZGVwKSB7XG4gICAgICAgIHZhciByZXMgPSByZXNvdXJjZS5nZXQoZGVwKTtcbiAgICAgICAgaWYodHlwZW9mIHJlcyA9PT0gJ3VuZGVmaW5lZCcpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Jlc291cmNlL2RlcGVuZGVuY2UgXCInICsgZGVwICsgJ1wiIGlzIG5vdCBmb3VuZC4nKTtcbiAgICAgICAgaWYocmVzLnJlc291cmNlVHlwZSA9PSAnc3Vicm91dGluZScpXG4gICAgICAgICAgICByZXR1cm4gdG9HTFNMKHJlcy50eXBlLCByZXMubmFtZSwgcmVzLmZuKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIHJlcy5oZWFkZXIoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1bmlxdWVEZXBzKGRlcHMpIHtcbiAgICAgICAgdmFyIG5hbWVzID0ge307XG4gICAgICAgIGRlcHMuZm9yRWFjaChmdW5jdGlvbihkLCBpKXtcbiAgICAgICAgICAgIG5hbWVzW2RdID0gaTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG5hbWVzKTtcbiAgICB9XG5cbiAgICBzaGFkZXIuY3JlYXRlID0gZnVuY3Rpb24oYXJnLCBmbil7XG4gICAgICAgIHZhciBvcHRpb24gPSBhcmcgfHwge30sXG4gICAgICAgICAgICBuYW1lID0gb3B0aW9uLm5hbWUgfHwgXCJkZWZhdWx0XCIsXG4gICAgICAgICAgICB0eXBlID0gb3B0aW9uLnR5cGUgfHwgXCJ2ZXJ0ZXhcIixcbiAgICAgICAgICAgIGRlcHMgPSBvcHRpb24ucmVxdWlyZSB8fCBvcHRpb24uZGVwcyB8fCBbXSxcbiAgICAgICAgICAgIHByZWNpc2lvbiA9IG9wdGlvbi5wcmVjaXNpb24gfHwgXCJoaWdoXCIsXG4gICAgICAgICAgICBkZWJ1ZyA9IG9wdGlvbi5kZWJ1ZyB8fCBmYWxzZSxcbiAgICAgICAgICAgIG1haW4gPSBvcHRpb24ubWFpbiB8fCBmbiB8fCBmdW5jdGlvbigpIHt9O1xuXG4gICAgICAgIHZhciBzaGFkZXJTb3VyY2UgPSAncHJlY2lzaW9uICcgKyBwcmVjaXNpb24gKyAncCBmbG9hdDtcXG4nO1xuXG4gICAgICAgIGlmKGRlcHMubGVuZ3RoID09PSAwKSBkZXBzID0gdW5pcXVlRGVwcyhnZXREZXBzKG1haW4pKTtcblxuICAgICAgICAvL2dldCBkZXBlbmRlbmNlIGZyb20gc3Vicm91dGluZXMgaWYgYW55XG4gICAgICAgIHZhciBleHRyYURlcHMgPSBbXSxcbiAgICAgICAgICAgIHN1YlJvdXRpbmVzID0gW107XG5cbiAgICAgICAgZGVwcy5mb3JFYWNoKGZ1bmN0aW9uKGRlcCl7XG4gICAgICAgICAgICB2YXIgcmVzID0gcmVzb3VyY2UuZ2V0KGRlcCk7XG4gICAgICAgICAgICBpZih0eXBlb2YgcmVzID09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGVwKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBFcnJvciAoJ0Vycm9yISBVbmRlZmluZWQgdmFyaWFibGUgaW4gc2hhZGVyOiAnKyAgZGVwLm5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYocmVzLnJlc291cmNlVHlwZSA9PSAnc3Vicm91dGluZScpIHtcbiAgICAgICAgICAgICAgICBzdWJSb3V0aW5lcy5wdXNoKHJlcy5uYW1lKTtcbiAgICAgICAgICAgICAgICB2YXIgc3ViRGVwcyA9IGdldEV4dHJhRGVwcyhyZXMuZm4udG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgaWYoc3ViRGVwcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9UT0RPOiBtYWtlIHRoaXMgcmVjdXJzaXZlIHRvIGNoZWNrIGFsbCBzdWJyb3V0aW5lIGRlcHNcbiAgICAgICAgICAgICAgICAgICAgc3ViRGVwcy5mb3JFYWNoKGZ1bmN0aW9uKHNkZXApe1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNyZXMgPSByZXNvdXJjZS5nZXQoc2RlcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihzcmVzLnJlc291cmNlVHlwZSA9PSAnc3Vicm91dGluZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0cmFEZXBzID0gZXh0cmFEZXBzLmNvbmNhdChnZXRFeHRyYURlcHMoc3Jlcy5mbi50b1N0cmluZygpKSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgICAgICAgZXh0cmFEZXBzID0gZXh0cmFEZXBzLmNvbmNhdChzdWJEZXBzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgaWYoZXh0cmFEZXBzLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIGFsbERlcHMgPSBleHRyYURlcHNcbiAgICAgICAgICAgIC8vIC5maWx0ZXIoZnVuY3Rpb24oZCl7XG4gICAgICAgICAgICAvLyAgICAgcmV0dXJuIGRlcHMuaW5kZXhPZihkKSA9PT0gLTE7XG4gICAgICAgICAgICAvLyB9KVxuICAgICAgICAgICAgLmNvbmNhdChkZXBzLmZpbHRlcihmdW5jdGlvbihkKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3ViUm91dGluZXMuaW5kZXhPZihkKSA9PT0gLTE7XG4gICAgICAgICAgICB9KSlcbiAgICAgICAgICAgIC5jb25jYXQoc3ViUm91dGluZXMpO1xuXG4gICAgICAgICAgICBkZXBzID0gdW5pcXVlRGVwcyhhbGxEZXBzKTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgaWYoQXJyYXkuaXNBcnJheShkZXBzKSl7XG4gICAgICAgICAgICBkZXBzLmZvckVhY2goZnVuY3Rpb24oZGVwKXtcbiAgICAgICAgICAgICAgICBzaGFkZXJTb3VyY2UgKz0gZGVjbGFyZURlcChkZXApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZih0eXBlb2YoZGVwcykgPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGRlcHMpLmZvckVhY2goZnVuY3Rpb24ocmVzb3VyY2VUeXBlKXtcbiAgICAgICAgICAgICAgICBkZXBzW3Jlc291cmNlVHlwZV0uZm9yRWFjaChmdW5jdGlvbihkZXApe1xuICAgICAgICAgICAgICAgICAgICBzaGFkZXJTb3VyY2UgKz0gZGVjbGFyZURlcChkZXApO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIHNoYWRlclNvdXJjZSArPSB0b0dMU0woJ3ZvaWQnLCAnbWFpbicsIG1haW4pO1xuICAgICAgICBpZihkZWJ1ZylcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHNoYWRlclNvdXJjZSk7XG4gICAgICAgIHZhciBfc2hhZGVyID0gY29tcGlsZShzaGFkZXJUeXBlW3R5cGVdLCBzaGFkZXJTb3VyY2UpO1xuICAgICAgICBfc2hhZGVyLl9zaGFkZXJUeXBlID0gc2hhZGVyVHlwZVt0eXBlXTtcbiAgICAgICAgX3NoYWRlci5kZXBzID0gZGVwcztcbiAgICAgICAgX3NoYWRlci5zb3VyY2UgPSBzaGFkZXJTb3VyY2U7XG4gICAgICAgIHNoYWRlclt0eXBlXVtuYW1lXSA9IF9zaGFkZXI7XG4gICAgICAgIHJldHVybiBfc2hhZGVyO1xuICAgIH1cblxuICAgIHJldHVybiBzaGFkZXI7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9zaGFkZXIuanNcbi8vIG1vZHVsZSBpZCA9IDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEiLCJpbXBvcnQgZmxleGdsIGZyb20gJy4vc3JjL21haW4nXHJcblxyXG52YXIgcm9vdCA9IHR5cGVvZiBzZWxmID09ICdvYmplY3QnICYmIHNlbGYuc2VsZiA9PT0gc2VsZiAmJiBzZWxmIHx8XHJcbiAgICAgICAgICAgdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwuZ2xvYmFsID09PSBnbG9iYWwgJiYgZ2xvYmFsIHx8XHJcbiAgICAgICAgICAgdGhpcztcclxuXHJcbnJvb3QuZmxleGdsID0gZmxleGdsO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZmxleGdsO1xyXG5cclxuaWYodHlwZW9mIG1vZHVsZSAhPSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cylcclxuICAgIG1vZHVsZS5leHBvcnRzID0gZmxleGdsO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEiLCJ2YXIgZztcclxuXHJcbi8vIFRoaXMgd29ya3MgaW4gbm9uLXN0cmljdCBtb2RlXHJcbmcgPSAoZnVuY3Rpb24oKSB7XHJcblx0cmV0dXJuIHRoaXM7XHJcbn0pKCk7XHJcblxyXG50cnkge1xyXG5cdC8vIFRoaXMgd29ya3MgaWYgZXZhbCBpcyBhbGxvd2VkIChzZWUgQ1NQKVxyXG5cdGcgPSBnIHx8IEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKSB8fCAoMSxldmFsKShcInRoaXNcIik7XHJcbn0gY2F0Y2goZSkge1xyXG5cdC8vIFRoaXMgd29ya3MgaWYgdGhlIHdpbmRvdyByZWZlcmVuY2UgaXMgYXZhaWxhYmxlXHJcblx0aWYodHlwZW9mIHdpbmRvdyA9PT0gXCJvYmplY3RcIilcclxuXHRcdGcgPSB3aW5kb3c7XHJcbn1cclxuXHJcbi8vIGcgY2FuIHN0aWxsIGJlIHVuZGVmaW5lZCwgYnV0IG5vdGhpbmcgdG8gZG8gYWJvdXQgaXQuLi5cclxuLy8gV2UgcmV0dXJuIHVuZGVmaW5lZCwgaW5zdGVhZCBvZiBub3RoaW5nIGhlcmUsIHNvIGl0J3NcclxuLy8gZWFzaWVyIHRvIGhhbmRsZSB0aGlzIGNhc2UuIGlmKCFnbG9iYWwpIHsgLi4ufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBnO1xyXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAod2VicGFjaykvYnVpbGRpbi9nbG9iYWwuanNcbi8vIG1vZHVsZSBpZCA9IDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9yaWdpbmFsTW9kdWxlKSB7XHJcblx0aWYoIW9yaWdpbmFsTW9kdWxlLndlYnBhY2tQb2x5ZmlsbCkge1xyXG5cdFx0dmFyIG1vZHVsZSA9IE9iamVjdC5jcmVhdGUob3JpZ2luYWxNb2R1bGUpO1xyXG5cdFx0Ly8gbW9kdWxlLnBhcmVudCA9IHVuZGVmaW5lZCBieSBkZWZhdWx0XHJcblx0XHRpZighbW9kdWxlLmNoaWxkcmVuKSBtb2R1bGUuY2hpbGRyZW4gPSBbXTtcclxuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2R1bGUsIFwibG9hZGVkXCIsIHtcclxuXHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcclxuXHRcdFx0Z2V0OiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRyZXR1cm4gbW9kdWxlLmw7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZSwgXCJpZFwiLCB7XHJcblx0XHRcdGVudW1lcmFibGU6IHRydWUsXHJcblx0XHRcdGdldDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0cmV0dXJuIG1vZHVsZS5pO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2R1bGUsIFwiZXhwb3J0c1wiLCB7XHJcblx0XHRcdGVudW1lcmFibGU6IHRydWUsXHJcblx0XHR9KTtcclxuXHRcdG1vZHVsZS53ZWJwYWNrUG9seWZpbGwgPSAxO1xyXG5cdH1cclxuXHRyZXR1cm4gbW9kdWxlO1xyXG59O1xyXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAod2VicGFjaykvYnVpbGRpbi9oYXJtb255LW1vZHVsZS5qc1xuLy8gbW9kdWxlIGlkID0gNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSIsImltcG9ydCBSZXNvdXJjZSBmcm9tICcuL3Jlc291cmNlJztcbmltcG9ydCBQcm9ncmFtTWFuYWdlciBmcm9tICcuL3Byb2dyYW0nO1xuaW1wb3J0IFNoYWRlciBmcm9tICcuL3NoYWRlcic7XG5pbXBvcnQgRnJhbWVidWZmZXIgZnJvbSAnLi9mcmFtZWJ1ZmZlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEZsZXhHTChhcmcpIHtcblxuICAgIHZhciBmbGV4Z2wgPSAodGhpcyBpbnN0YW5jZW9mIEZsZXhHTCkgPyB0aGlzIDoge30sXG4gICAgICAgIG9wdGlvbnMgPSBhcmcgfHwge30sXG4gICAgICAgIGNvbnRhaW5lciA9IG9wdGlvbnMuY29udGFpbmVyIHx8IG51bGwsXG4gICAgICAgIGNhbnZhcyA9IG9wdGlvbnMuY2FudmFzIHx8IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIiksXG4gICAgICAgIHdpZHRoID0gb3B0aW9ucy53aWR0aCB8fCBudWxsLFxuICAgICAgICBoZWlnaHQgPSBvcHRpb25zLmhlaWdodCB8fCBudWxsLFxuICAgICAgICBwYWRkaW5nID0gb3B0aW9ucy5wYWRkaW5nIHx8IHtcbiAgICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgICByaWdodDogMCxcbiAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgIGJvdHRvbTogMFxuICAgICAgICB9LFxuICAgICAgICBjdHggPSBvcHRpb25zLmNvbnRleHQgfHwgb3B0aW9ucy5jdHggfHwgbnVsbCxcbiAgICAgICAga2VybmVscyA9IHt9LFxuICAgICAgICBwcm9ncmFtID0gbnVsbCxcbiAgICAgICAgZ2xBdHRyID0gb3B0aW9ucy5hdHRyaWJ1dGVzIHx8IHt9LFxuICAgICAgICBzaGFyZWRGdW5jdGlvbiA9IG9wdGlvbnMuc2hhcmVkRnVuY3Rpb24gfHwge307XG5cblxuICAgIGlmICh0eXBlb2YoY2FudmFzKSA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGlmIChjYW52YXNbMF0gPT0gXCIjXCIpIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNhdm5hcy5zdWJzdHJpbmcoMSkpO1xuICAgICAgICBlbHNlIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNhdm5hcyk7XG4gICAgfVxuICAgIGlmIChjb250YWluZXIpIHtcbiAgICAgICAgY29udGFpbmVyID0gKHR5cGVvZihjb250YWluZXIpID09IFwic3RyaW5nXCIpID8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29udGFpbmVyKSA6IGNvbnRhaW5lcjtcbiAgICAgICAgaWYgKHdpZHRoID09PSBudWxsKSB3aWR0aCA9IGNvbnRhaW5lci5jbGllbnRXaWR0aDtcbiAgICAgICAgaWYgKGhlaWdodCA9PT0gbnVsbCkgaGVpZ2h0ID0gY29udGFpbmVyLmNsaWVudEhlaWdodDtcbiAgICB9XG4gICAgLy8gd2lkdGggLT0gcGFkZGluZy5sZWZ0ICsgcGFkZGluZy5yaWdodDtcbiAgICAvLyBoZWlnaHQgLT0gcGFkZGluZy50b3AgKyBwYWRkaW5nLmJvdHRvbTtcbiAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIGNhbnZhcy5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcbiAgICBjYW52YXMuc3R5bGUubWFyZ2luTGVmdCA9IHBhZGRpbmcubGVmdCArIFwicHhcIjtcbiAgICBjYW52YXMuc3R5bGUubWFyZ2luVG9wID0gcGFkZGluZy50b3AgKyBcInB4XCI7XG5cbiAgICBpZiAoY3R4ID09PSBudWxsKVxuICAgICAgICBjdHggPSBzZXR1cFdlYkdMKGNhbnZhcyk7XG4gICAgZmxleGdsLmN0eCA9IGN0eDtcbiAgICBmbGV4Z2wuY2FudmFzID0gY2FudmFzO1xuXG4gICAgY3R4Ll9kaWN0ID0gb3B0aW9ucy5lbnYgfHwgb3B0aW9ucy5kaWN0IHx8IG9wdGlvbnMuZGljdGlvbmFyeSB8fCB7fTtcblxuXG4gICAgdmFyIHJlc291cmNlcyA9IG5ldyBSZXNvdXJjZShjdHgpLFxuICAgICAgICBmcmFtZWJ1ZmZlcnMgPSBuZXcgRnJhbWVidWZmZXIoY3R4KSxcbiAgICAgICAgcHJvZ3JhbU1hbmFnZXIgPSBuZXcgUHJvZ3JhbU1hbmFnZXIoY3R4LCByZXNvdXJjZXMpLFxuICAgICAgICBzaGFkZXJzID0gbmV3IFNoYWRlcihjdHgsIHJlc291cmNlcyk7XG5cbiAgICB2YXIgYmxlbmRFeHQgPSBjdHguZ2V0RXh0ZW5zaW9uKFwiRVhUX2JsZW5kX21pbm1heFwiKTtcbiAgICBpZiAoYmxlbmRFeHQpIHtcbiAgICAgICAgY3R4Lk1BWF9FWFQgPSBibGVuZEV4dC5NQVhfRVhUO1xuICAgICAgICBjdHguTUlOX0VYVCA9IGJsZW5kRXh0Lk1JTl9FWFQ7XG4gICAgfVxuXG4gICAgY3R4LmV4dCA9IGN0eC5nZXRFeHRlbnNpb24oXCJBTkdMRV9pbnN0YW5jZWRfYXJyYXlzXCIpO1xuICAgIGVuYWJsZUV4dGVuc2lvbihbXG4gICAgICAgIFwiT0VTX3RleHR1cmVfZmxvYXRcIixcbiAgICAgICAgXCJPRVNfdGV4dHVyZV9mbG9hdF9saW5lYXJcIixcbiAgICAgICAgLy8gXCJPRVNfdGV4dHVyZV9oYWxmX2Zsb2F0XCIsXG4gICAgICAgIC8vIFwiT0VTX3RleHR1cmVfaGFsZl9mbG9hdF9saW5lYXJcIlxuICAgIF0pO1xuXG4gICAgaWYgKGNvbnRhaW5lcilcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGNhbnZhcyk7XG5cbiAgICBmdW5jdGlvbiBzZXR1cFdlYkdMKGNhbnZhcykge1xuICAgICAgICB2YXIgbmFtZXMgPSBbXCJ3ZWJnbFwiLCBcImV4cGVyaW1lbnRhbC13ZWJnbFwiXTtcbiAgICAgICAgdmFyIGdsID0gbnVsbDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuYW1lcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBnbCA9IGNhbnZhcy5nZXRDb250ZXh0KG5hbWVzW2ldLCBnbEF0dHIpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgICAgIGlmIChnbCkgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGdsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGVuYWJsZUV4dGVuc2lvbihleHRlbnNpb25zKSB7XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShleHRlbnNpb25zKSkgZXh0ZW5zaW9ucyA9IFtleHRlbnNpb25zXTtcbiAgICAgICAgZXh0ZW5zaW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGV4dGVuc2lvbikge1xuICAgICAgICAgICAgdmFyIGV4dFByb3BzID0gY3R4LmdldEV4dGVuc2lvbihleHRlbnNpb24pO1xuICAgICAgICAgICAgaWYgKGV4dFByb3BzICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoZXh0UHJvcHMpLmZvckVhY2goZnVuY3Rpb24oZXApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFleHQuaGFzT3duUHJvcGVydHkoZXApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHguZXh0W2VwXSA9IGV4dFByb3BzW2VwXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBmbGV4Z2wuZW5hYmxlRXh0ZW5zaW9uID0gZW5hYmxlRXh0ZW5zaW9uO1xuXG4gICAgLyoqXG4gICAgICogQWxsb2NhdGUgQXR0cmlidXRlcyBpbiB2ZXJ0ZXggYnVmZmVyIGFycmF5IHN0b3JlZCBpbiBHUFUgbWVtb3J5XG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lIGF0dHJpYnV0ZSBuYW1lXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSB0eXBlIGF0dHJpYnV0ZSB0eXBlOiBmbG9hdCwgdmVjMiwgLi4uXG4gICAgICogQHBhcmFtICB7QXJyYXl9IGRhdGEgZGF0YSB2YWx1ZXNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9ICAgICAgRkxleEdMIG9iamVjdFxuICAgICAqL1xuICAgIGZsZXhnbC5hdHRyaWJ1dGUgPSBmdW5jdGlvbihuYW1lLCB0eXBlLCBkYXRhKSB7XG4gICAgICAgIHJlc291cmNlcy5hbGxvY2F0ZShcImF0dHJpYnV0ZVwiLCBuYW1lLCB0eXBlLCBkYXRhKTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGZsZXhnbC5hdHRyaWJ1dGUsIG5hbWUsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc291cmNlcy5hdHRyaWJ1dGVbbmFtZV07XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgcmVzb3VyY2VzLmF0dHJpYnV0ZVtuYW1lXS5sb2FkKGRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGZsZXhnbDtcbiAgICB9O1xuICAgIGZsZXhnbC5idWZmZXIgPSBmbGV4Z2wuYXR0cmlidXRlOyAvL2FsaWFzXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBVbmlmb3JtIHZhcmlhYmxlIGZvciBXZWJHTCBzaGFkZXIgcHJvZ3JhbXNcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWUgYXR0cmlidXRlIG5hbWVcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IHR5cGUgdW5pZm9ybSB2YXJpYWJsZSB0eXBlOiBmbG9hdCwgdmVjMiwgLi4uXG4gICAgICogQHBhcmFtICB7QXJyYXl9IGRhdGEgZGF0YSB2YWx1ZXNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9ICAgICAgRkxleEdMIG9iamVjdFxuICAgICAqL1xuICAgIGZsZXhnbC51bmlmb3JtID0gZnVuY3Rpb24obmFtZSwgdHlwZSwgZGF0YSkge1xuICAgICAgICByZXNvdXJjZXMuYWxsb2NhdGUoXCJ1bmlmb3JtXCIsIG5hbWUsIHR5cGUsIGRhdGEpO1xuICAgICAgICBpZiAoIWZsZXhnbC51bmlmb3JtLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZmxleGdsLnVuaWZvcm0sIG5hbWUsIHtcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzb3VyY2VzLnVuaWZvcm1bbmFtZV07XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VzLnVuaWZvcm1bbmFtZV0ubG9hZChkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN0eC5pc1Byb2dyYW0ocHJvZ3JhbSkpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZXMudW5pZm9ybVtuYW1lXS5saW5rKHByb2dyYW0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmbGV4Z2w7XG4gICAgfTtcblxuICAgIGZsZXhnbC51bmlmb3JtLnNlcmlhbGl6ZSA9IGZ1bmN0aW9uKGFvYSkge1xuICAgICAgICB2YXIgc2EgPSBbXTtcbiAgICAgICAgYW9hLmZvckVhY2goZnVuY3Rpb24oYSkge1xuICAgICAgICAgICAgc2EgPSBzYS5jb25jYXQoYSk7XG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiBzYTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBVbmlmb3JtIHZhcmlhYmxlIGZvciBXZWJHTCBzaGFkZXIgcHJvZ3JhbXNcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWUgYXR0cmlidXRlIG5hbWVcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IHR5cGUgdGV4dHVyZSB0eXBlOiB1bnNpZ25lZF9ieXRlIG9yIGZsb2F0LCAuLi5cbiAgICAgKiBAcGFyYW0gIHtBcnJheX0gZGF0YSBkYXRhIHZhbHVlc1xuICAgICAqIEBwYXJhbSAge0FycmF5fSBkaW0gW3dpZHRoLCBoZWlnaHRdXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBbY2hhbm5lbD0nYWxwaGEnXSBXZWJHTCBmb3JtYXRzIChyZ2JhLCBhbHBoYSlcbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IFtzYW1wbGVyPW51bGxdIEZMZXhHTCBVbmlmb3JtIE9iamVjdFxuICAgICAqIEByZXR1cm4ge09iamVjdH0gICAgICBGTGV4R0wgb2JqZWN0XG4gICAgICovXG4gICAgZmxleGdsLnRleHR1cmUgPSBmdW5jdGlvbihuYW1lLCB0eXBlLCBkYXRhLCBkaW0sIGNoYW5uZWwsIHNhbXBsZXIpIHtcbiAgICAgICAgcmVzb3VyY2VzLmFsbG9jYXRlKFwidGV4dHVyZVwiLCBuYW1lLCB0eXBlLCBkaW0sIGNoYW5uZWwsIGRhdGEsIHNhbXBsZXIpO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZmxleGdsLnRleHR1cmUsIG5hbWUsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc291cmNlcy50ZXh0dXJlW25hbWVdO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIHJlc291cmNlcy50ZXh0dXJlW25hbWVdLmxvYWQoZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZmxleGdsO1xuICAgIH1cblxuICAgIGZsZXhnbC50ZXh0dXJlLnVwZGF0ZSA9IGZ1bmN0aW9uKG5hbWUsIGRhdGEsIG9mZnNldCwgZGltKSB7XG4gICAgICAgIHJlc291cmNlcy50ZXh0dXJlW25hbWVdLnVwZGF0ZShkYXRhLCBvZmZzZXQsIGRpbSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgVW5pZm9ybSB2YXJpYWJsZSBmb3IgV2ViR0wgc2hhZGVyIHByb2dyYW1zXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lIGF0dHJpYnV0ZSBuYW1lXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBbdHlwZV0gVmFyeWluZyB2YXJpYWJsZSB0eXBlOiBmbG9hdCwgdmVjMiwgLi4uXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBbc2l6ZT0xXSBkYXRhIGFycmF5XG4gICAgICogQHJldHVybiB7T2JqZWN0fSAgICAgIEZMZXhHTCBvYmplY3RcbiAgICAgKi9cbiAgICBmbGV4Z2wudmFyeWluZyA9IGZ1bmN0aW9uKG5hbWUsIHR5cGUsIHNpemUpIHtcbiAgICAgICAgcmVzb3VyY2VzLmFsbG9jYXRlKFwidmFyeWluZ1wiLCBuYW1lLCB0eXBlLCBzaXplKTtcbiAgICAgICAgcmV0dXJuIGZsZXhnbDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgVW5pZm9ybSB2YXJpYWJsZSBmb3IgV2ViR0wgc2hhZGVyIHByb2dyYW1zXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lIGF0dHJpYnV0ZSBuYW1lXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSB0eXBlIGF0dHJpYnV0ZSB0eXBlOiBmbG9hdCwgdmVjMiwgLi4uXG4gICAgICogQHBhcmFtICB7QXJyYXl9IGRpbSBbd2lkdGgsIGhlaWdodF1cbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IFt0ZXh0dXJlPW51bGxdIEZMZXhHTCBUZXh0dXJlIE9iamVjdFxuICAgICAqIEByZXR1cm4ge09iamVjdH0gICAgICBGTGV4R0wgb2JqZWN0XG4gICAgICovXG4gICAgZmxleGdsLmZyYW1lYnVmZmVyID0gZnVuY3Rpb24obmFtZSwgdHlwZSwgZGltLCB0ZXh0dXJlKSB7XG4gICAgICAgIHZhciB0ZXh0dXJlID0gdGV4dHVyZSB8fCByZXNvdXJjZXMuYWxsb2NhdGUoJ3RleHR1cmUnLCBuYW1lLCB0eXBlLCBkaW0sICdyZ2JhJywgbnVsbCk7XG5cbiAgICAgICAgZnJhbWVidWZmZXJzLmNyZWF0ZShuYW1lLCB0eXBlLCBkaW0sIHRleHR1cmUpO1xuICAgICAgICBpZiAoIWZsZXhnbC5mcmFtZWJ1ZmZlci5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGZsZXhnbC5mcmFtZWJ1ZmZlciwgbmFtZSwge1xuICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmcmFtZWJ1ZmZlcnNbbmFtZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZsZXhnbDtcbiAgICB9XG5cbiAgICBmbGV4Z2wuZnJhbWVidWZmZXIuZW5hYmxlUmVhZCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgZnJhbWVidWZmZXJzW25hbWVdLmVuYWJsZVJlYWQocHJvZ3JhbSk7XG4gICAgfVxuXG4gICAgZmxleGdsLmJpbmRGcmFtZWJ1ZmZlciA9IGZ1bmN0aW9uKGZiTmFtZSkge1xuICAgICAgICBpZiAoZmJOYW1lID09PSBudWxsKVxuICAgICAgICAgICAgY3R4LmJpbmRGcmFtZWJ1ZmZlcihjdHguRlJBTUVCVUZGRVIsIG51bGwpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjdHguYmluZEZyYW1lYnVmZmVyKGN0eC5GUkFNRUJVRkZFUiwgZnJhbWVidWZmZXJzW2ZiTmFtZV0ucHRyKTtcbiAgICB9XG5cbiAgICBmbGV4Z2wuc3Vicm91dGluZSA9IGZ1bmN0aW9uKG5hbWUsIHR5cGUsIGZuKSB7XG4gICAgICAgIHJlc291cmNlcy5hbGxvY2F0ZShcInN1YnJvdXRpbmVcIiwgbmFtZSwgdHlwZSwgZm4pO1xuICAgICAgICByZXR1cm4gZmxleGdsO1xuICAgIH1cblxuICAgIGZsZXhnbC5wYXJhbWV0ZXIgPSBmdW5jdGlvbihrZXlWYWx1ZVBhaXJzKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKGtleVZhbHVlUGFpcnMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICBjdHguX2RpY3Rba2V5XSA9IGtleVZhbHVlUGFpcnNba2V5XTtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGN0eC5fZGljdFtrZXldKSkge1xuICAgICAgICAgICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY3R4Ll9kaWN0LCBrZXksIHtcbiAgICAgICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBrZXlWYWx1ZVBhaXJzW2tleV1baSsrXTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgc2V0OiBmdW5jdGlvbihuZXdBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHguX2RpY3Rba2V5XSA9IG5ld0FycmF5O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYodHlwZW9mKGN0eC5fZGljdFtrZXldKSA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIHZhciBkaWN0S2V5cyA9IE9iamVjdC5rZXlzKGN0eC5fZGljdFtrZXldKTtcbiAgICAgICAgICAgICAgICBmeGdsLnVuaWZvcm0oJ2RpY3QnK2tleSwgJ2Zsb2F0JywgZGljdEtleXMubWFwKGQ9PmN0eC5fZGljdFtrZXldW2RdKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiBmbGV4Z2w7XG4gICAgfVxuXG4gICAgZmxleGdsLmRpY3Rpb25hcnkgPSBmbGV4Z2wucGFyYW1ldGVyO1xuXG4gICAgZmxleGdsLnNoYWRlciA9IHByb2dyYW1NYW5hZ2VyLnNoYWRlcjtcblxuICAgIGZsZXhnbC5wcm9ncmFtID0gZnVuY3Rpb24obmFtZSwgdnMsIGZzKSB7XG4gICAgICAgIHByb2dyYW0gPSBwcm9ncmFtTWFuYWdlci5wcm9ncmFtKG5hbWUsIHZzLCBmcyk7XG4gICAgICAgIHJldHVybiBjdHg7XG4gICAgfVxuXG4gICAgZmxleGdsLmNyZWF0ZVByb2dyYW0gPSBmdW5jdGlvbihuYW1lLCB2cywgZnMpIHtcbiAgICAgICAgcHJvZ3JhbSA9IHByb2dyYW1NYW5hZ2VyLmNyZWF0ZShuYW1lLCB2cywgZnMpO1xuICAgICAgICByZXR1cm4gY3R4O1xuICAgIH1cblxuICAgIGZsZXhnbC5hcHAgPSBmdW5jdGlvbihuYW1lLCBwcm9wcykge1xuICAgICAgICB2YXIgdnMgPSBmbGV4Z2wuc2hhZGVyLnZlcnRleChwcm9wcy52cyksXG4gICAgICAgICAgICBmcyA9IGZsZXhnbC5zaGFkZXIuZnJhZ21lbnQocHJvcHMuZnMpLFxuICAgICAgICAgICAgZmIgPSBwcm9wcy5mcmFtZWJ1ZmZlciB8fCBudWxsO1xuXG4gICAgICAgIGZsZXhnbC5wcm9ncmFtKG5hbWUsIHZzLCBmcyk7XG5cbiAgICAgICAgdmFyIGRyYXcgPSBwcm9wcy5yZW5kZXIgfHwgcHJvcHMuZHJhdztcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIGdsID0gZmxleGdsLnByb2dyYW0obmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gZHJhdy5jYWxsKGdsLCBhcmdzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZsZXhnbC5kaW1lbnNpb24gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIFtjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHRdO1xuICAgIH1cblxuICAgIGZsZXhnbC5yZXNvdXJjZXMgPSByZXNvdXJjZXM7XG5cbiAgICByZXR1cm4gZmxleGdsO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvbWFpbi5qc1xuLy8gbW9kdWxlIGlkID0gNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSIsImltcG9ydCBVbmlmb3JtIGZyb20gJy4vdW5pZm9ybSc7XG5pbXBvcnQgQXR0cmlidXRlIGZyb20gJy4vYXR0cmlidXRlJztcbmltcG9ydCBUZXh0dXJlIGZyb20gJy4vdGV4dHVyZSc7XG5pbXBvcnQgVmFyeWluZyBmcm9tICcuL3ZhcnlpbmcnO1xuaW1wb3J0IFN1YnJvdXRpbmUgZnJvbSAnLi9zdWJyb3V0aW5lJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUmVzb3VyY2UoZ2xDb250ZXh0KSB7XG4gICAgdmFyIHJlc291cmNlID0gKHRoaXMgaW5zdGFuY2VvZiBSZXNvdXJjZSkgPyB0aGlzIDoge30sXG4gICAgICAgIGdwdVJlc291cmNlcyA9IHt9O1xuXG4gICAgcmVzb3VyY2UudW5pZm9ybSA9IG5ldyBVbmlmb3JtKGdsQ29udGV4dCk7XG4gICAgcmVzb3VyY2UuYXR0cmlidXRlID0gbmV3IEF0dHJpYnV0ZShnbENvbnRleHQpO1xuICAgIHJlc291cmNlLnRleHR1cmUgPSBuZXcgVGV4dHVyZShnbENvbnRleHQpO1xuICAgIHJlc291cmNlLnZhcnlpbmcgPSBuZXcgVmFyeWluZyhnbENvbnRleHQpO1xuICAgIHJlc291cmNlLnN1YnJvdXRpbmUgPSBuZXcgU3Vicm91dGluZSgpO1xuXG4gICAgdmFyIHJlc291cmNlVHlwZXMgPSBbJ3VuaWZvcm0nLCAnYXR0cmlidXRlJywgJ3RleHR1cmUnLCAndmFyeWluZycsICdzdWJyb3V0aW5lJ107XG5cbiAgICByZXNvdXJjZS5hbGxvY2F0ZSA9IGZ1bmN0aW9uKHR5cGUsIHByb3BzKSB7XG4gICAgICAgIGlmIChyZXNvdXJjZVR5cGVzLmluZGV4T2YodHlwZSkgPT09IC0xKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcIkVycm9yOiBJbnZhbGlkIHJlc291cmNlIHR5cGU6IFwiICsgdHlwZSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlcyA9IHJlc291cmNlW3R5cGVdLmNyZWF0ZS5hcHBseShudWxsLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICAgICAgcmVzLnJlc291cmNlVHlwZSA9IHR5cGU7XG4gICAgICAgIGdwdVJlc291cmNlc1tyZXMubmFtZV0gPSByZXM7XG4gICAgICAgIGlmICghZ3B1UmVzb3VyY2VzLmhhc093blByb3BlcnR5KHJlcy5uYW1lKSkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGdwdVJlc291cmNlcywgcmVzLm5hbWUsIHtcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZ3B1UmVzb3VyY2VzW3Jlcy5uYW1lXTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNldDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBncHVSZXNvdXJjZXNbcmVzLm5hbWVdLmxvYWQoZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9O1xuXG4gICAgcmVzb3VyY2UubGluayA9IGZ1bmN0aW9uKHByb2dyYW0sIHJlc291cmNlcykge1xuICAgICAgICB2YXIgcmVxdWlyZWRSZXNvdXJjZXMgPSAoQXJyYXkuaXNBcnJheShyZXNvdXJjZXMpKSA/IHJlc291cmNlcyA6IE9iamVjdC5rZXlzKGdwdVJlc291cmNlcyk7XG4gICAgICAgIHJlcXVpcmVkUmVzb3VyY2VzLmZvckVhY2goZnVuY3Rpb24ocmVzb3VyY2VOYW1lKSB7XG4gICAgICAgICAgICBpZiAoZ3B1UmVzb3VyY2VzLmhhc093blByb3BlcnR5KHJlc291cmNlTmFtZSkpXG4gICAgICAgICAgICAgICAgZ3B1UmVzb3VyY2VzW3Jlc291cmNlTmFtZV0ubGluayhwcm9ncmFtKTtcbiAgICAgICAgfSlcbiAgICB9O1xuXG4gICAgcmVzb3VyY2UuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICAgICAgICByZXR1cm4gZ3B1UmVzb3VyY2VzW25hbWVdO1xuICAgIH1cblxuICAgIHJlc291cmNlLmNyZWF0ZSA9IHJlc291cmNlLmFsbG9jYXRlO1xuXG4gICAgcmV0dXJuIHJlc291cmNlO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3Jlc291cmNlLmpzXG4vLyBtb2R1bGUgaWQgPSA3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQXR0cmlidXRlKGdsQ29udGV4dCkge1xuICAgIFxuICAgIHZhciBhdHRyaWJ1dGUgPSAodGhpcyBpbnN0YW5jZW9mIEF0dHJpYnV0ZSkgPyB0aGlzIDoge30sXG4gICAgICAgIGN0eCA9IGdsQ29udGV4dCxcbiAgICAgICAgYXR0cmlidXRlSUQgPSAwO1xuXG4gICAgZnVuY3Rpb24gc2V0QXR0cmlidXRlKG5hbWUsIGRhdGEpIHtcbiAgICAgICAgaWYoQXJyYXkuaXNBcnJheShkYXRhKSB8fCBBcnJheUJ1ZmZlci5pc1ZpZXcoZGF0YSkpe1xuICAgICAgICAgICAgaWYoIUFycmF5QnVmZmVyLmlzVmlldyhkYXRhKSkgZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoZGF0YSk7XG4gICAgICAgICAgICBhdHRyaWJ1dGVbbmFtZV0uZGF0YSA9IGRhdGE7XG4gICAgICAgICAgICBjdHguYmluZEJ1ZmZlcihjdHguQVJSQVlfQlVGRkVSLCBhdHRyaWJ1dGVbbmFtZV0ucHRyKTtcbiAgICAgICAgICAgIGN0eC5idWZmZXJEYXRhKGN0eC5BUlJBWV9CVUZGRVIsIGRhdGEsIGN0eC5TVEFUSUNfRFJBVyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXR0cmlidXRlLmNyZWF0ZSA9IGZ1bmN0aW9uKG5hbWUsIHR5cGUsIGRhdGEpIHtcbiAgICAgICAgYXR0cmlidXRlW25hbWVdID0ge1xuICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgIHR5cGU6IHR5cGUgfHwgJ2Zsb2F0JyxcbiAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICBsb2NhdGlvbjogYXR0cmlidXRlSUQrKyxcbiAgICAgICAgICAgIHB0cjogY3R4LmNyZWF0ZUJ1ZmZlcigpLFxuICAgICAgICAgICAgc2l6ZTogcGFyc2VJbnQodHlwZS5zbGljZSgzLDQpKSB8fCAxXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYoZGF0YSAhPT0gbnVsbCAmJiBkYXRhLmxlbmd0aCkgc2V0QXR0cmlidXRlKG5hbWUsIGRhdGEpO1xuXG4gICAgICAgIGF0dHJpYnV0ZVtuYW1lXS5saW5rID0gZnVuY3Rpb24ocHJvZ3JhbSkge1xuICAgICAgICAgICAgY3R4LmJpbmRCdWZmZXIoY3R4LkFSUkFZX0JVRkZFUiwgdGhpcy5wdHIpO1xuICAgICAgICAgICAgdGhpcy5sb2NhdGlvbiA9IGN0eC5nZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCB0aGlzLm5hbWUpO1xuICAgICAgICAgICAgY3R4LnZlcnRleEF0dHJpYlBvaW50ZXIodGhpcy5sb2NhdGlvbiwgdGhpcy5zaXplLCBjdHguRkxPQVQsIGZhbHNlLCAwLCAwKTtcbiAgICAgICAgICAgIGN0eC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSh0aGlzLmxvY2F0aW9uKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgYXR0cmlidXRlW25hbWVdLmxvYWQgPSBmdW5jdGlvbihhcnJheUJ1ZmZlcikge1xuICAgICAgICAgICAgc2V0QXR0cmlidXRlKHRoaXMubmFtZSwgYXJyYXlCdWZmZXIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBhdHRyaWJ1dGVbbmFtZV0uaGVhZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2F0dHJpYnV0ZSAnICsgdGhpcy50eXBlICsgJyAnICsgdGhpcy5uYW1lICsgJztcXG4nO1xuICAgICAgICB9XG5cbiAgICAgICAgYXR0cmlidXRlW25hbWVdLmRlbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY3R4LmRlbGV0ZUJ1ZmZlcih0aGlzLnB0cik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXR0cmlidXRlW25hbWVdO1xuICAgIH07XG5cbiAgICByZXR1cm4gYXR0cmlidXRlO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvYXR0cmlidXRlLmpzXG4vLyBtb2R1bGUgaWQgPSA4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gVmFyeWluZyhnbENvbnRleHQpIHtcblxuICAgIHZhciB2YXJ5aW5nID0gKHRoaXMgaW5zdGFuY2VvZiBWYXJ5aW5nKSA/IHRoaXMgOiB7fSxcbiAgICAgICAgY3R4ID0gZ2xDb250ZXh0O1xuXG4gICAgdmFyeWluZy5jcmVhdGUgPSBmdW5jdGlvbihuYW1lLCB0eXBlLCBzaXplKSB7XG4gICAgICAgIHZhcnlpbmdbbmFtZV0gPSB7XG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgdHlwZTogdHlwZSB8fCAnZmxvYXQnLFxuICAgICAgICAgICAgc2l6ZTogc2l6ZSB8fCAxLFxuICAgICAgICB9O1xuXG4gICAgICAgIHZhcnlpbmdbbmFtZV0ubGluayA9IGZ1bmN0aW9uKCkge307XG5cbiAgICAgICAgdmFyeWluZ1tuYW1lXS5oZWFkZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBoZWFkZXIgPSAndmFyeWluZyAnICsgdGhpcy50eXBlICsgJyAnICsgdGhpcy5uYW1lO1xuICAgICAgICAgICAgaWYodGhpcy5zaXplID4gMSlcbiAgICAgICAgICAgICAgICBoZWFkZXIgKz0gJ1snICsgdGhpcy5zaXplICsgJ10nO1xuICAgICAgICAgICAgcmV0dXJuIGhlYWRlciArICc7XFxuJztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB2YXJ5aW5nW25hbWVdO1xuICAgIH1cblxuICAgIHJldHVybiB2YXJ5aW5nO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvdmFyeWluZy5qc1xuLy8gbW9kdWxlIGlkID0gOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFN1YnJvdXRpbmUoKSB7XG5cbiAgICB2YXIgc3Vicm91dGluZSA9ICh0aGlzIGluc3RhbmNlb2YgU3Vicm91dGluZSkgPyB0aGlzIDoge307XG5cbiAgICBzdWJyb3V0aW5lLmNyZWF0ZSA9IGZ1bmN0aW9uKG5hbWUsIHR5cGUsIGZuKSB7XG4gICAgICAgIHN1YnJvdXRpbmVbbmFtZV0gPSB7XG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgdHlwZTogdHlwZSB8fCAnZmxvYXQnLFxuICAgICAgICAgICAgZm46IGZuLFxuICAgICAgICAgICAgcmVzb3VyY2VUeXBlOiBcInN1YnJvdXRpbmVcIlxuICAgICAgICB9O1xuXG4gICAgICAgIHN1YnJvdXRpbmVbbmFtZV0ubGluayA9IGZ1bmN0aW9uKHByb2dyYW0pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgc3Vicm91dGluZVtuYW1lXS5sb2FkID0gZnVuY3Rpb24oZm4pIHtcbiAgICAgICAgICAgIHN1YnJvdXRpbmVbbmFtZV0uZm4gPSBmbjtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgc3Vicm91dGluZVtuYW1lXS5oZWFkZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZuLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc3Vicm91dGluZVtuYW1lXTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHN1YnJvdXRpbmU7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9zdWJyb3V0aW5lLmpzXG4vLyBtb2R1bGUgaWQgPSAxMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSIsImltcG9ydCBTaGFkZXIgZnJvbSAnLi9zaGFkZXInO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBQcm9ncmFtKGdsQ29udGV4dCwgcmVzb3VyY2VzKSB7XG5cbiAgICB2YXIgcHJvZ3JhbSxcbiAgICAgICAgY3R4ID0gZ2xDb250ZXh0LFxuICAgICAgICBwbSA9IHt9LFxuICAgICAgICBrZXJuZWxzID0ge30sXG4gICAgICAgIHNoYWRlcnMgPSBuZXcgU2hhZGVyKGdsQ29udGV4dCwgcmVzb3VyY2VzKTtcblxuICAgIHBtLmNyZWF0ZSA9IGZ1bmN0aW9uKG5hbWUsIHZzLCBmcykge1xuICAgICAgICB2YXIgbmFtZSA9IG5hbWUgfHwgXCJkZWZhdWx0XCIsXG4gICAgICAgICAgICB2cyA9IHZzIHx8IFwiZGVmYXVsdFwiLFxuICAgICAgICAgICAgZnMgPSBmcyB8fCBcImRlZmF1bHRcIixcbiAgICAgICAgICAgIGRlcHMgPSBbXTtcblxuICAgICAgICBpZiAoa2VybmVscy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgcG0uZGVsZXRlKG5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAga2VybmVsc1tuYW1lXSA9IGN0eC5jcmVhdGVQcm9ncmFtKCk7XG5cbiAgICAgICAga2VybmVsc1tuYW1lXS52cyA9ICh0eXBlb2YgdnMgPT0gXCJvYmplY3RcIikgPyB2cyA6IHNoYWRlcnMudmVydGV4W3ZzXTtcbiAgICAgICAga2VybmVsc1tuYW1lXS5mcyA9ICh0eXBlb2YgZnMgPT0gXCJvYmplY3RcIikgPyBmcyA6IHNoYWRlcnMuZnJhZ21lbnRbZnNdO1xuXG4gICAgICAgIGN0eC5hdHRhY2hTaGFkZXIoa2VybmVsc1tuYW1lXSwga2VybmVsc1tuYW1lXS52cyk7XG4gICAgICAgIGN0eC5hdHRhY2hTaGFkZXIoa2VybmVsc1tuYW1lXSwga2VybmVsc1tuYW1lXS5mcyk7XG4gICAgICAgIGN0eC5saW5rUHJvZ3JhbShrZXJuZWxzW25hbWVdKTtcbiAgICAgICAgdmFyIGxpbmtlZCA9IGN0eC5nZXRQcm9ncmFtUGFyYW1ldGVyKGtlcm5lbHNbbmFtZV0sIGN0eC5MSU5LX1NUQVRVUyk7XG4gICAgICAgIGlmICghbGlua2VkKSB7XG4gICAgICAgICAgICB2YXIgbGFzdEVycm9yID0gY3R4LmdldFByb2dyYW1JbmZvTG9nKGtlcm5lbHNbbmFtZV0pO1xuICAgICAgICAgICAgdGhyb3cgKFwiRXJyb3IgaW4gcHJvZ3JhbSBsaW5raW5nOlwiICsgbGFzdEVycm9yKTtcbiAgICAgICAgICAgIGN0eC5kZWxldGVQcm9ncmFtKGtlcm5lbHNbbmFtZV0pO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBkZXBzID0gZGVwcy5jb25jYXQoa2VybmVsc1tuYW1lXS52cy5kZXBzKTtcbiAgICAgICAgZGVwcyA9IGRlcHMuY29uY2F0KGtlcm5lbHNbbmFtZV0uZnMuZGVwcyk7XG4gICAgICAgIGtlcm5lbHNbbmFtZV0uZGVwcyA9IGRlcHM7XG5cbiAgICAgICAgcmV0dXJuIGtlcm5lbHNbbmFtZV07XG4gICAgfVxuXG4gICAgcG0udXNlID0gcG0ucHJvZ3JhbSA9IGZ1bmN0aW9uKG5hbWUsIHZzLCBmcykge1xuICAgICAgICBpZiAoa2VybmVscy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgcHJvZ3JhbSA9IGtlcm5lbHNbbmFtZV07XG4gICAgICAgICAgICBjdHgudXNlUHJvZ3JhbShwcm9ncmFtKTtcbiAgICAgICAgICAgIHJlc291cmNlcy5saW5rKHByb2dyYW0sIHByb2dyYW0uZGVwcyk7XG4gICAgICAgICAgICByZXR1cm4gcHJvZ3JhbTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBwbS5jcmVhdGUobmFtZSwgdnMsIGZzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHBtLmRlbGV0ZSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgaWYgKGtlcm5lbHMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgICAgIGN0eC5kZXRhY2hTaGFkZXIoa2VybmVsc1tuYW1lXSwga2VybmVsc1tuYW1lXS52cyk7XG4gICAgICAgICAgICBjdHguZGV0YWNoU2hhZGVyKGtlcm5lbHNbbmFtZV0sIGtlcm5lbHNbbmFtZV0uZnMpO1xuICAgICAgICAgICAgY3R4LmRlbGV0ZVByb2dyYW0oa2VybmVsc1tuYW1lXSk7XG4gICAgICAgICAgICBkZWxldGUga2VybmVsc1tuYW1lXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHBtLnNoYWRlciA9IGZ1bmN0aW9uKGFyZywgZm4pIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSBhcmc7XG4gICAgICAgIHNoYWRlcnMuY3JlYXRlKG9wdGlvbnMsIGZuKTtcbiAgICAgICAgcmV0dXJuIHBtO1xuICAgIH1cblxuICAgIHBtLnNoYWRlci52ZXJ0ZXggPSBmdW5jdGlvbihmbikge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgIHR5cGU6IFwidmVydGV4XCJcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKGZuLm5hbWUpIG9wdGlvbnMubmFtZSA9IGZuLm5hbWU7XG4gICAgICAgIHJldHVybiBzaGFkZXJzLmNyZWF0ZShvcHRpb25zLCBmbik7XG4gICAgfVxuXG4gICAgcG0uc2hhZGVyLmZyYWdtZW50ID0gZnVuY3Rpb24oZm4pIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgICAgICB0eXBlOiBcImZyYWdtZW50XCJcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKGZuLm5hbWUpIG9wdGlvbnMubmFtZSA9IGZuLm5hbWU7XG4gICAgICAgIHJldHVybiBzaGFkZXJzLmNyZWF0ZShvcHRpb25zLCBmbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBtO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvcHJvZ3JhbS5qc1xuLy8gbW9kdWxlIGlkID0gMTFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEiLCJpbXBvcnQgVGV4dHVyZSBmcm9tICcuL3RleHR1cmUnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBGcmFtZWJ1ZmZlcihnbENvbnRleHQpIHtcblxuICAgIHZhciBmcmFtZWJ1ZmZlciA9ICh0aGlzIGluc3RhbmNlb2YgRnJhbWVidWZmZXIpID8gdGhpcyA6IHt9LFxuICAgICAgICBjdHggPSBnbENvbnRleHQ7XG5cbiAgICBmcmFtZWJ1ZmZlci5jcmVhdGUgPSBmdW5jdGlvbihuYW1lLCB0eXBlLCBkaW0sIHRleHR1cmUpIHtcblxuICAgICAgICBmcmFtZWJ1ZmZlcltuYW1lXSA9IHtcbiAgICAgICAgICAgIHB0cjogY3R4LmNyZWF0ZUZyYW1lYnVmZmVyKCksXG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgdHlwZTogdHlwZSB8fCBcImZsb2F0XCIsXG4gICAgICAgICAgICB3aWR0aDogZGltWzBdIHx8IDEwMjQsXG4gICAgICAgICAgICBoZWlnaHQ6IGRpbVsxXSB8fCAxMDI0LFxuICAgICAgICAgICAgdGV4dHVyZTogdGV4dHVyZSB8fCBudWxsLFxuICAgICAgICAgICAgcmVuZGVyYnVmZmVyOiBjdHguY3JlYXRlUmVuZGVyYnVmZmVyKCksXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZnJhbWVidWZmZXJbbmFtZV0udGV4dHVyZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIGJ1ZiA9ICh0eXBlID09ICdmbG9hdCcpID9cbiAgICAgICAgICAgICAgICBuZXcgRmxvYXQzMkFycmF5KGRpbVswXSAqIGRpbVsxXSAqIDQpIDpcbiAgICAgICAgICAgICAgICBuZXcgVWludDhBcnJheShkaW1bMF0gKiBkaW1bMV0gKiA0KTtcbiAgICAgICAgICAgIGZyYW1lYnVmZmVyW25hbWVdLnRleHR1cmUgPSBUZXh0dXJlKGN0eCkuY3JlYXRlKG5hbWUsIHR5cGUsIGRpbSwgXCJyZ2JhXCIsIGJ1Zik7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVuZGVyYnVmZmVyID0gZnJhbWVidWZmZXJbbmFtZV0ucmVuZGVyYnVmZmVyO1xuICAgICAgICBjdHguYmluZEZyYW1lYnVmZmVyKGN0eC5GUkFNRUJVRkZFUiwgZnJhbWVidWZmZXJbbmFtZV0ucHRyKTtcbiAgICAgICAgY3R4LmJpbmRSZW5kZXJidWZmZXIoY3R4LlJFTkRFUkJVRkZFUiwgcmVuZGVyYnVmZmVyKTtcbiAgICAgICAgY3R4LnJlbmRlcmJ1ZmZlclN0b3JhZ2UoXG4gICAgICAgICAgICBjdHguUkVOREVSQlVGRkVSLFxuICAgICAgICAgICAgY3R4LkRFUFRIX0NPTVBPTkVOVDE2LFxuICAgICAgICAgICAgZnJhbWVidWZmZXJbbmFtZV0ud2lkdGgsXG4gICAgICAgICAgICBmcmFtZWJ1ZmZlcltuYW1lXS5oZWlnaHRcbiAgICAgICAgKTtcbiAgICAgICAgY3R4LmZyYW1lYnVmZmVyVGV4dHVyZTJEKFxuICAgICAgICAgICAgY3R4LkZSQU1FQlVGRkVSLFxuICAgICAgICAgICAgY3R4LkNPTE9SX0FUVEFDSE1FTlQwLFxuICAgICAgICAgICAgY3R4LlRFWFRVUkVfMkQsXG4gICAgICAgICAgICBmcmFtZWJ1ZmZlcltuYW1lXS50ZXh0dXJlLnB0cixcbiAgICAgICAgICAgIDBcbiAgICAgICAgKTtcbiAgICAgICAgY3R4LmZyYW1lYnVmZmVyUmVuZGVyYnVmZmVyKFxuICAgICAgICAgICAgY3R4LkZSQU1FQlVGRkVSLFxuICAgICAgICAgICAgY3R4LkRFUFRIX0FUVEFDSE1FTlQsXG4gICAgICAgICAgICBjdHguUkVOREVSQlVGRkVSLFxuICAgICAgICAgICAgcmVuZGVyYnVmZmVyXG4gICAgICAgICk7XG4gICAgICAgIGN0eC5iaW5kUmVuZGVyYnVmZmVyKGN0eC5SRU5ERVJCVUZGRVIsIG51bGwpO1xuICAgICAgICBjdHguYmluZEZyYW1lYnVmZmVyKGN0eC5GUkFNRUJVRkZFUiwgbnVsbCk7XG5cbiAgICAgICAgZnJhbWVidWZmZXJbbmFtZV0uZW5hYmxlUmVhZCA9IGZ1bmN0aW9uKHByb2dyYW0pIHtcbiAgICAgICAgICAgIGN0eC5hY3RpdmVUZXh0dXJlKGN0eC5URVhUVVJFMCArIHRoaXMudGV4dHVyZS5pbmRleCk7XG4gICAgICAgICAgICBjdHguYmluZFRleHR1cmUoY3R4LlRFWFRVUkVfMkQsIHRoaXMudGV4dHVyZS5wdHIpO1xuICAgICAgICAgICAgdGhpcy50ZXh0dXJlLmxvY2F0aW9uID0gY3R4LmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCB0aGlzLnRleHR1cmUubmFtZSk7XG4gICAgICAgICAgICBjdHgudW5pZm9ybTFpKHRoaXMudGV4dHVyZS5sb2NhdGlvbiwgdGhpcy50ZXh0dXJlLmluZGV4KTtcbiAgICAgICAgfTtcblxuICAgICAgICBmcmFtZWJ1ZmZlcltuYW1lXS5kZWxldGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGN0eC5iaW5kUmVuZGVyYnVmZmVyKGdsLlJFTkRFUkJVRkZFUiwgbnVsbCk7XG4gICAgICAgICAgICBjdHguYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICAgICAgICAgIGN0eC5kZWxldGVSZW5kZXJidWZmZXIodGhpcy5yZW5kZXJidWZmZXIpO1xuICAgICAgICAgICAgY3R4LmRlbGV0ZVRleHR1cmUodGhpcy50ZXh0dXJlLnB0cilcbiAgICAgICAgICAgIGN0eC5kZWxldGVGcmFtZWJ1ZmZlcih0aGlzLnB0cik7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIGZyYW1lYnVmZmVyW25hbWVdO1xuICAgIH1cblxuICAgIHJldHVybiBmcmFtZWJ1ZmZlcjtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2ZyYW1lYnVmZmVyLmpzXG4vLyBtb2R1bGUgaWQgPSAxMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSJdLCJzb3VyY2VSb290IjoiIn0=