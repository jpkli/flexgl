var fxgl = new FlexGL({
    container: document.body,
});

var zeroArray = new Float32Array(1024*4);
for(var i = 0; i < zeroArray.length; i++){
    zeroArray[i] = 0.0;
}
fxgl.attribute('a_position', 'vec2', [-1.0, -1.0, 1.0, 1.0])
    .attribute('a_texcoord', 'float', [0.0, 1.0])
    .framebuffer('f_sum_texture', 'float', [1024, 1])
    .texture('f_mem_texture_0', 'float', zeroArray, [1024, 1], 'rgba')
    .texture('f_mem_texture_1', 'float', zeroArray, [1024, 1], 'rgba')
    .framebuffer('f_mem_texture_0', 'float', [1024, 1], fxgl.texture['f_mem_texture_0'])
    .framebuffer('f_mem_texture_1', 'float', [1024, 1], fxgl.texture['f_mem_texture_1']);

var data = [];
for(var j = 0; j < 100; j++){
    var typedArray = new Float32Array(1024*1024);
    for (var i = 0; i < typedArray.length; i++){
        typedArray[i] = Math.random()/100;
    }  
    data.push(typedArray);  
}


// var data = new Float32Array(1024*1024);
// for (var i = 0; i < data.length; i++){
//     data[i] = Math.random();
// }  
  

var pointer = -1;

        
var updateButton = document.querySelector('.update');
var updateClickStream = Rx.Observable.fromEvent(updateButton, 'click');

var requestStream = updateClickStream.startWith('startup click')
    .map(function(){
        pointer++;
        if(pointer > 99){
            alert('Out of Stack!');
            pointer--;
        }
        return pointer;
    });

var responseStream = requestStream
    .map(function(p){
        return data[pointer];
    });

var i = 0;
responseStream.subscribe(function(data_chunk){
    if(pointer === 0){
        fxgl.texture('u_texture', 'float', data_chunk, [1024, 1024]);
    }
    else{
        fxgl.texture['u_texture'] = data_chunk;
    }
    fxgl.app('drawLine0', {
        vsource: `
            attribute vec2 a_position;
            attribute float a_texcoord; 
            varying float v_texcoord;

            void main(){ 
                gl_Position = vec4(a_position, 0, 1.0);
                v_texcoord = a_texcoord;
            }
        `,
        fsource: `
            precision highp float; 
            uniform sampler2D u_texture;
            varying float v_texcoord;

            void main(){ 
                float sum = 0.0;
                for(float i = 0.0; i < 1024.0; i++){
                    sum += texture2D(u_texture, vec2(v_texcoord, (i+0.5)/1024.0)).a;
                }
                sum /= 1024.0;
                gl_FragColor = vec4(sum, 0.0, 0.0, 1.0);

            }
        `,
    }, 0);



    if(i%2 === 0){
        fxgl.app('drawLine2', {
            vsource: `
                attribute vec2 a_position;
                attribute float a_texcoord; 
                varying float v_texcoord;

                void main(){ 
                    gl_Position = vec4(a_position, 0, 1.0);
                    v_texcoord = a_texcoord;
                }
            `,
            fsource: `
                precision highp float; 
                uniform sampler2D f_sum_texture;
                uniform sampler2D f_mem_texture_0;
                varying float v_texcoord;

                void main(){
                    float v0 = texture2D(f_sum_texture, vec2(v_texcoord, 0.5)).x;
                    float v1 = texture2D(f_mem_texture_0, vec2(v_texcoord, 0.5)).x;
                    gl_FragColor = vec4(v0+v1, 0.0, 0.0, 1.0);
                }
            `,
        }, 2);    

        fxgl.app('drawLine4', {
            vsource: `
                attribute vec2 a_position;
                attribute float a_texcoord; 
                varying float v_texcoord;

                void main(){ 
                    gl_Position = vec4(a_position, 0, 1.0);
                    v_texcoord = a_texcoord;
                }
            `,
            fsource: `
                precision highp float; 
                uniform sampler2D f_mem_texture_1;
                varying float v_texcoord;

                void main(){
                    gl_FragColor = texture2D(f_mem_texture_1, vec2(v_texcoord, 0.5));
                }
            `,
        }, 4);

    }
    else{
        fxgl.app('drawLine3', {
            vsource: `
                attribute vec2 a_position;
                attribute float a_texcoord; 
                varying float v_texcoord;

                void main(){ 
                    gl_Position = vec4(a_position, 0, 1.0);
                    v_texcoord = a_texcoord;
                }
            `,
            fsource: `
                precision highp float; 
                uniform sampler2D f_sum_texture;
                uniform sampler2D f_mem_texture_1;
                varying float v_texcoord;

                void main(){
                    float v0 = texture2D(f_sum_texture, vec2(v_texcoord, 0.5)).x;
                    float v1 = texture2D(f_mem_texture_1, vec2(v_texcoord, 0.5)).x;
                    gl_FragColor = vec4(v0+v1, 0.0, 0.0, 1.0);
                }
            `,
        }, 3);   

        fxgl.app('drawLine5', {
            vsource: `
                attribute vec2 a_position;
                attribute float a_texcoord; 
                varying float v_texcoord;

                void main(){ 
                    gl_Position = vec4(a_position, 0, 1.0);
                    v_texcoord = a_texcoord;
                }
            `,
            fsource: `
                precision highp float; 
                uniform sampler2D f_mem_texture_0;
                varying float v_texcoord;

                void main(){
                    gl_FragColor = texture2D(f_mem_texture_0, vec2(v_texcoord, 0.5));
                }
            `,
        }, 5);

    }

    i++;
});


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



//Create Program

            //gl_FragColor = vec4(0.0, texture2D(u_texture, vec2(v_texcoord, (88.0+0.5)/1024.0)).a, 0.0, 1.0);
            // gl_FragColor = vec4(sum, 0.0, 0.0, 1.0);




// fxgl.app('drawLine1', {
//     vsource: `
//         attribute vec2 a_position;

//         void main(){ 
//             gl_Position = vec4(a_position, 0, 1.0);
//         }
//     `,
//     fsource: `
//         precision highp float; 

//         void main(){
//             gl_FragColor = vec4(0.5, 0.5, 0.0, 1.0);
//         }
//     `,
// });

// simpleDraw(); // draw triangle
//            gl_FragColor = vec4(texture2D(u_texture, vec2(217, 217))[3], texture2D(u_texture, vec2(117, 117))[3], texture2D(u_texture, vec2(0, 0))[3], 1.0); 
    //uniform float u_color; \
 // gl_FragColor = vec4(u_color, u_color, u_color, 1.0); \
 //            gl_FragColor = vec4(texture2D(u_texture, vec2(0.5, 0.5))[0], texture2D(u_texture, vec2(0.2, 0.2))[0], texture2D(u_texture, vec2(0.3, 0.3))[0], 1.0); 



    // fxgl.app('drawLine1', {
    //     vsource: `
    //         attribute vec2 a_position;
    //         attribute float a_texcoord; 
    //         varying float v_texcoord;

    //         void main(){ 
    //             gl_Position = vec4(a_position, 0, 1.0);
    //             v_texcoord = a_texcoord;
    //         }
    //     `,
    //     fsource: `
    //         precision highp float; 
    //         uniform sampler2D f_sum_texture;
    //         varying float v_texcoord;

    //         void main(){
    //             gl_FragColor = texture2D(f_sum_texture, vec2(v_texcoord, 0.5));
    //         }
    //     `,
    // }, 1);







