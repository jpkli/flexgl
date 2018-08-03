var fxgl = new FlexGL({
    container: document.body,
    width: 800,
    height: 600
});

// //Allocate and manage resources
// fxgl.attribute('aVertexPos', 'vec2', [-1, 0, 1, 1, 0, -1.0])
//     .uniform('uColor', 'vec4', [1.0, 0.2, 0.75, 1.0]);
//
// //Create Program
// var simpleDraw = fxgl.app('drawTriangle', {
//     vs: function() {
//         gl_Position = vec4(this.aVertexPos, 0, 1.0);
//     },
//     fs: function() {
//         gl_FragColor = this.uColor;
//     },
//     render: function(len) {
//         this.drawArrays(this.TRIANGLES, 0, len);
//     }
// });
//
// simpleDraw(3); // draw triangle
//
// //change vertices and color
// fxgl.attribute.aVertexPos = [
//     -0.5, -0.5, 0.5, -0.5, -0.5, 0.5,
//     -0.5,  0.5, 0.5, -0.5, 0.5, 0.5
// ];
// fxgl.uniform.uColor = [0.4, 0.1, 0.5, 1.0]
//
// simpleDraw(6); // draw rectangle

// const buffer = new ArrayBuffer(1024*1024*1024*4);
const typedArray = new Float32Array(1024*1024);
var rx = new Reactive(typedArray, 1024);

// normalArray = Array.prototype.slice.call(typedArray);
fxgl.attribute('nums', 'float', typedArray);
console.log('1');
