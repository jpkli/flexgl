var root = typeof self == 'object' && self.self === self && self ||
           typeof global == 'object' && global.global === global && global ||
           this;
// root.define = require('amdefine/intercept');
root.flexgl = require('./src/flexgl');
