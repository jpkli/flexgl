if(typeof(define) !== 'function') var define = require('amdefine')(module);

define(function(require){
    var Uniform = require('./uniform'),
        Attribute = require('./attribute'),
        Texture = require('./texture'),
        Varying = require('./varying');

    return function Resource(glContext){
        'use strict';
        var resource = (this instanceof Resource) ? this : {},
            ctx = glContext,
            gpuResources = {};

        resource.uniform = new Uniform(ctx);
        resource.attribute = new Attribute(ctx);
        resource.texture = new Texture(ctx);
        resource.varying = new Varying(ctx);

        var resourceTypes = ['uniform', 'attribute', 'texture', 'varying'];

        resource.allocate = function(type, props) {
            if(resourceTypes.indexOf(type) === -1)
                throw Error("Error: Invalid resource type: " + type);

            var res = resource[type].create.apply(null, Array.prototype.slice.call(arguments, 1));
            res.resourceType = type;
            gpuResources[res.name] = res;
            return res;
        };

        resource.link = function(program, resources) {
            var requiredResources = (Array.isArray(resources)) ? resources : Object.keys(gpuResources);
            requiredResources.forEach(function(resourceName) {
                if(gpuResources.hasOwnProperty(resourceName))
                    gpuResources[resourceName].link(program);
            })
        };

        resource.get = function(name) {
            return gpuResources[name];
        }

        resource.create = resource.allocate;

        return resource;
    };
});
