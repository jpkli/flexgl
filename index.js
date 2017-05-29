var root = typeof self == 'object' && self.self === self && self ||
           typeof global == 'object' && global.global === global && global ||
           this;

if(typeof(define) !== 'function')
    var define = require('amdefine')(module);

root.FlexGL = require('./src/flexgl');
