import Uniform from './uniform';
import Attribute from './attribute';
import Texture from './texture';
import Varying from './varying';
import Subroutine from './subroutine';

export default function Resource(glContext) 
{
    var resource = (this instanceof Resource) ? this : {},
        gpuResources = {};

    resource.uniform = new Uniform(glContext);
    resource.attribute = new Attribute(glContext);
    resource.texture = new Texture(glContext);
    resource.varying = new Varying(glContext);
    resource.subroutine = new Subroutine();

    var resourceTypes = ['uniform', 'attribute', 'texture', 'varying', 'subroutine'];

    resource.allocate = function(type, props) 
    {
        if (resourceTypes.indexOf(type) === -1) 
            throw Error("Error: Invalid resource type: " + type);
        
        var res = resource[type].create.apply(null, Array.prototype.slice.call(arguments, 1));
        res.resourceType = type;
        gpuResources[res.name] = res;
        if (!gpuResources.hasOwnProperty(res.name)) 
        {
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

    resource.link = function(program, resources) 
    {
        var requiredResources = (Array.isArray(resources)) ? resources : Object.keys(gpuResources);
        requiredResources.forEach(function(resourceName) {
            if (gpuResources.hasOwnProperty(resourceName))
                gpuResources[resourceName].link(program);
        })
    };

    resource.get = function(name) 
        return gpuResources[name];

    resource.create = resource.allocate;

    return resource;
};
