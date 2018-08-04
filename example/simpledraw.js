var fxgl = new FlexGL({
    container: document.body,
    width: 800,
    height: 600
});

var typedArray = new Float32Array(1024*1024*256);
for (var i = 0; i < typedArray.length; i++){
    typedArray[i] = Math.random() * 100;
}


var data = typedArray;
var sum = 0;
var size = 1024;
var pointer = -1;
        
var updateButton = document.querySelector('.update');
var updateClickStream = Rx.Observable.fromEvent(updateButton, 'click');

var requestStream = updateClickStream.startWith('startup click')
    .map(function(){
        pointer++;
        return pointer;
    });

var responseStream = requestStream
    .map(function(p){
        return data.slice(p*size, (p+1)*size);
    });

responseStream.subscribe(function(d){
    var data_chunk = d;
    if(fxgl.resources.attribute.hasOwnProperty('nums')) { 
        fxgl.attribute['nums'] = data_chunk; 
    }
    else { fxgl.attribute('nums', 'float', data_chunk);}
    
    sum += data_chunk.reduce(function(x,y){
        return x+y;
    });
    console.log(sum);
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

// normalArray = Array.prototype.slice.call(typedArray);
