var fxgl = new FlexGL({
    container: document.body,
    width: 800,
    height: 600
});

var typedArray = new Float32Array(1024*1024);
for (var i = 0; i < typedArray.length; i++){
    typedArray[i] = Math.random();
}


// var data = typedArray;
// var sum = 0;
// var size = 1024;
// var pointer = -1;
// var vertex = 'attribute vec4 a_position; void main(){gl_Position = a_position;}';
// var fragment = 'precision mediump float; void main() {gl_FragColor = vec4(1, 0, 0.5, 1);}';
        
// var updateButton = document.querySelector('.update');
// var updateClickStream = Rx.Observable.fromEvent(updateButton, 'click');

// var requestStream = updateClickStream.startWith('startup click')
//     .map(function(){
//         pointer++;
//         return pointer;
//     });

// var responseStream = requestStream
//     .map(function(p){
//         return data.slice(p*size, (p+1)*size);
//     });

// responseStream.subscribe(function(d){
//     var data_chunk = d;
//     if(fxgl.resources.attribute.hasOwnProperty('nums')) { 
//         fxgl.attribute['nums'] = data_chunk; 
//     }
//     else { fxgl.attribute('nums', 'float', data_chunk);}
    
//     sum += data_chunk.reduce(function(x,y){
//         return x+y;
//     });
//     console.log(sum);
// });


// fxgl.attribute('aVertexPos', 'vec2', [-1, 0, 1, 1, 0, -1.0])
//     .uniform('uColor', 'vec4', [0.1, 1.0, 0.75, 1.0]);

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

// simpleDraw(3); // draw triangle

// //change vertices and color
// fxgl.attribute.aVertexPos = [
//     -0.5, -0.5, 0.5, -0.5, -0.5, 0.5,
//     -0.5,  0.5, 0.5, -0.5, 0.5, 0.5
// ];
// fxgl.uniform.uColor = [1.0, 1.0, 0.5, 1.0]

// simpleDraw(6); // draw rectangle




fxgl.attribute('a_position', 'vec2', [-0.5, -0.5, 0.5, -0.5, -0.5, 0.5,
                                        -0.5, 0.5, 0.5, -0.5, 0.5, 0.5]);
    .attribute('a_texcoord', 'vec2', [0, 0, 0, 1, 1, 0,
                                        0, 1, 1, 1, 1, 0,])
    // .uniform('u_color', 'float', [0.2])
    .framebuffer('target_texture_0', 'float', [1024, 1024])
    .framebuffer('target_texture_1', 'float', [1024, 1024])
    .texture('u_texture', 'float', typedArray, [1024, 1024]);

//Create Program
var simpleDraw = fxgl.app('drawTriangle', {
    vsource: `
        attribute vec2 a_position;
        attribute vec2 a_texcoord; 
        varying vec2 v_texcoord;

        void main(){ 
            gl_Position = vec4(a_position, 0, 1.0);
        }
    `,
    fsource: `
        precision highp float; 
        uniform sampler2D u_texture;
        varying vec2 v_texcoord;

        float sum = 0.0; 

        void main(){ 
            for(float i = 0.0; i < 512.0; i++){
                for(float j = 0.0; j < 512.0; j++){
                    sum += texture2D(u_texture, vec2(i/512.0, j/512.0))[3];
                }
            }
            sum /= 512.0 * 512.0;
            gl_FragColor = vec4(vec3(sum), 1.0); 
        }
    `,
    // render: function(len) {
    //     this.drawArrays(this.TRIANGLES, 0, len);
    // }
});

simpleDraw(3); // draw triangle
//            gl_FragColor = vec4(texture2D(u_texture, vec2(217, 217))[3], texture2D(u_texture, vec2(117, 117))[3], texture2D(u_texture, vec2(0, 0))[3], 1.0); 
    //uniform float u_color; \
 // gl_FragColor = vec4(u_color, u_color, u_color, 1.0); \
 //            gl_FragColor = vec4(texture2D(u_texture, vec2(0.5, 0.5))[0], texture2D(u_texture, vec2(0.2, 0.2))[0], texture2D(u_texture, vec2(0.3, 0.3))[0], 1.0); 









