import Resource from './resource';
import Program from './program';
import Framebuffer from './framebuffer';
// import Reactive from './reactive';

export default function FlexGL(arg) {

    var flexgl = (this instanceof FlexGL) ? this : {};


    var options = arg || {},
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
    flexgl.resources = resources;
    ctx._dict = options.env || options.dict || options.dictionary || {};

    var resources = new Resource(ctx),
        framebuffers = new Framebuffer(ctx),
        program = new Program(ctx, resources),
        realProgram = null;


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
                gl = canvas.getContext(names[i]);
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
        if (!flexgl.attribute.hasOwnProperty(name)) {
            Object.defineProperty(flexgl.attribute, name, { //after allocating, flexgl gets new key attribute, helping easily change attribute data.
                get(){
                    return resources.attribute[name];
                },
                set(data){
                    resources.attribute[name].load(data);
                }
            });
        }
        return flexgl;
    };
    // flexgl.buffer = flexgl.attribute; //alias

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
                    if (ctx.isProgram(realProgram))                    ///////////////////
                        resources.uniform[name].link(realProgram);        /////////////////
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

    // flexgl.framebuffer.enableRead = function(name, program) {
    //     framebuffers[name].enableRead(program);
    // }

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
    flexgl.shader = program.shader;


    flexgl.app = function(name, source, num) {

        // fb = source.framebuffer || null;

        if(num === 0){
            ctx.viewport(0, 0, 1024, 1);
            realProgram = program.use(name, source.vsource, source.fsource);
            // this.attribute['a_position'].link(realProgram);
            // this.attribute['a_texcoord'].link(realProgram);
            // this.texture['u_texture'].link(realProgram);
            this.bindFramebuffer('f_sum_texture');
        }

        else if(num === 1){
            ctx.viewport(0, 0, ctx.canvas.width, ctx.canvas.height);
            realProgram = program.use(name, source.vsource, source.fsource);
            // this.attribute['a_position'].link(realProgram);
            // this.attribute['a_texcoord'].link(realProgram);
            
            this.bindFramebuffer(null);
            // this.framebuffer.enableRead('f_sum_texture', realProgram);
        }

        else if(num === 2){
            this.bindFramebuffer(null);

            ctx.viewport(0, 0, 1024, 1);
            realProgram = program.use(name, source.vsource, source.fsource);
            // this.attribute['a_position'].link(realProgram);
            // this.attribute['a_texcoord'].link(realProgram);

            this.bindFramebuffer('f_mem_texture_1');
            // this.framebuffer.enableRead('f_mem_texture_0', realProgram);
            // this.framebuffer.enableRead('f_sum_texture', realProgram);
        }

        else if(num === 3){
            this.bindFramebuffer(null);

            ctx.viewport(0, 0, 1024, 1);
            realProgram = program.use(name, source.vsource, source.fsource);
            // this.attribute['a_position'].link(realProgram);
            // this.attribute['a_texcoord'].link(realProgram);

            this.bindFramebuffer('f_mem_texture_0');
            // this.framebuffer.enableRead('f_mem_texture_1', realProgram);
            // this.framebuffer.enableRead('f_sum_texture', realProgram);
        }

        else if(num === 4){
            ctx.viewport(0, 0, ctx.canvas.width, ctx.canvas.height);
            realProgram = program.use(name, source.vsource, source.fsource);
            // this.attribute['a_position'].link(realProgram);
            // this.attribute['a_texcoord'].link(realProgram);
            
            this.bindFramebuffer(null);
            // this.framebuffer.enableRead('f_mem_texture_1', realProgram);
        }

        else if(num === 5){
            ctx.viewport(0, 0, ctx.canvas.width, ctx.canvas.height);
            realProgram = program.use(name, source.vsource, source.fsource);
            // this.attribute['a_position'].link(realProgram);
            // this.attribute['a_texcoord'].link(realProgram);
            
            this.bindFramebuffer(null);
            // this.framebuffer.enableRead('f_mem_texture_0', realProgram);
        }

        // this.uniform['u_texture'].link(realProgram);    
        // var draw = source.render || source.draw;

        // return function(args) {
        //     // var gl = flexgl.program(name);
        //     return draw.call(ctx, args);
        // }

        ctx.drawArrays(ctx.LINES, 0, 2);
    }

    flexgl.dimension = function() {
        return [canvas.width, canvas.height];
    }

    return flexgl;
}
