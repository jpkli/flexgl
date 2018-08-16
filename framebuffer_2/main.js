"use strict";

function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.getElementById("canvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // var blendExt = gl.getExtension("EXT_blend_minmax");
  // if (blendExt) {
  //     gl.MAX_EXT = blendExt.MAX_EXT;
  //     gl.MIN_EXT = blendExt.MIN_EXT;
  // }
  // gl.ext = gl.getExtension("ANGLE_instanced_arrays");
  gl.getExtension("OES_texture_float");
  gl.getExtension("OES_texture_float_linear");

  // setup GLSL program
  var program = webglUtils.createProgramFromScripts(gl, ["3d-vertex-shader", "3d-fragment-shader"]);

  // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(program, "a_position");
  var texcoordLocation = gl.getAttribLocation(program, "a_texcoord");

  // lookup uniforms
  var textureLocation = gl.getUniformLocation(program, "u_texture");
  var flagLocation = gl.getUniformLocation(program, "flag");

  // Create a buffer for positions
  var positionBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Put the positions in the buffer
  setGeometry(gl);

  // provide texture coordinates for the rectangle.
  var texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  // Set Texcoords.
  setTexcoords(gl);

  // Create a texture.
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  {
    // fill texture with 3x2 pixels
    const level = 0;
    const internalFormat = gl.ALPHA;
    const width = 1024;
    const height = 1024;
    const border = 0;
    const format = gl.ALPHA;
    const type = gl.FLOAT;
    // const type = gl.UNSIGNED_BYTE;

    // var data = [];
    // for(var j = 0; j < 100; j++){
    //     var typedArray = new Float32Array(1024*1024);
    //     for (var i = 0; i < typedArray.length; i++){
    //         typedArray[i] = Math.random();
    //     }  
    //     data.push(typedArray);  
    // }

    var data = new Float32Array(1024*1024);
    for(var i = 0; i < data.length; i++){
      data[i] = Math.random();
    }

    // var typedArray = new Float32Array(1024*1024);
    // var typedArray = new Uint8Array(1024*1024);

    const alignment = 1;
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, alignment);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border,
                  format, type, data);

    // set the filtering so we don't need mips and it's not filtered
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  // Create a texture to render to
  const targetTextureWidth = 1024;
  const targetTextureHeight = 1;
  const targetTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, targetTexture);

  {
    // define size and format of level 0
    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.FLOAT;
    // const type = gl.UNSIGNED_BYTE;
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  targetTextureWidth, targetTextureHeight, border,
                  format, type, null);

    // set the filtering so we don't need mips
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // 
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  // Create and bind the framebuffer
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

  // attach the texture as the first color attachment
  const attachmentPoint = gl.COLOR_ATTACHMENT0;
  const level = 0;
  gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level);


  requestAnimationFrame(drawScene);


  function drawCube(flag) {
    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the position attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 3 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset);

    // Turn on the teccord attribute
    gl.enableVertexAttribArray(texcoordLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 1;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        texcoordLocation, size, type, normalize, stride, offset);


    // Tell the shader to use texture unit 0 for u_texture
    gl.uniform1i(textureLocation, 0);
    gl.uniform1i(flagLocation, flag);

    // Draw the geometry.
    gl.drawArrays(gl.LINES, 0, 2);
  }

  // Draw the scene.
  function drawScene() {

    {
      // render to our targetTexture by binding the framebuffer
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

      // render cube with our 3x2 texture
      gl.bindTexture(gl.TEXTURE_2D, texture);

      // Tell WebGL how to convert from clip space to pixels
      gl.viewport(0, 0, targetTextureWidth, targetTextureHeight);

      // Clear the canvas AND the depth buffer.
      gl.clearColor(0, 0, 0, 0);   // clear to blue
      gl.clear(gl.COLOR_BUFFER_BIT);

      drawCube(0);
    }

    {
      // render to the canvas
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      // render the cube with the texture we just rendered to
      gl.bindTexture(gl.TEXTURE_2D, targetTexture);
      // gl.bindTexture(gl.TEXTURE_2D, texture);

      // Tell WebGL how to convert from clip space to pixels
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      // Clear the canvas AND the depth buffer.
      gl.clearColor(0, 0, 0, 0);   // clear to white
      gl.clear(gl.COLOR_BUFFER_BIT);

      drawCube(1);
    }

    requestAnimationFrame(drawScene);
  }
}

// Fill the buffer with the values that define a cube.
// function setGeometry(gl) {
//   var positions = new Float32Array(
//     [
//     -1.0, -1.0,  0.0,
//     -1.0,  1.0,  0.0,
//      1.0, -1.0,  0.0,
//     -1.0,  1.0,  0.0,
//      1.0,  1.0,  0.0,
//      1.0, -1.0,  0.0,
//     ]);
//   gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
// }
function setGeometry(gl) {
  var positions = new Float32Array(
    [
    -1.0, -1.0,
    1.0,  1.0,
    ]);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}
// function setTexcoords(gl) {
//   gl.bufferData(
//       gl.ARRAY_BUFFER,
//       new Float32Array(
//         [
//           0, 0,
//           0, 1,
//           1, 0,
//           0, 1,
//           1, 1,
//           1, 0,
//       ]),
//       gl.STATIC_DRAW);
// }
// Fill the buffer with texture coordinates the cube.
// function setTexcoords(gl) {
//   gl.bufferData(
//       gl.ARRAY_BUFFER,
//       new Float32Array(
//         [
//           0.0, 0.0,
//           1.0, 0.0,
//           0.0, 0.0,
//           1.0, 0.0,
//           1.0, 0.0,
//           0.0, 0.0,
//       ]),
//       gl.STATIC_DRAW);
// }
function setTexcoords(gl) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(
        [
          0.0,
          1.0,
      ]),
      gl.STATIC_DRAW);
}


main();
