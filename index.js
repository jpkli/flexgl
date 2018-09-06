import flexgl from './src/main'

var root = typeof self == 'object' && self.self === self && self ||
           typeof global == 'object' && global.global === global && global ||
           this;

root.flexgl = flexgl;

export default flexgl;

if(typeof module != 'undefined' && module.exports)
    module.exports = flexgl;