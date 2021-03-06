# FlexGL - A declarative JavaScript library for developing WebGL based applications.

## Beta Warning: still in pre-beta/alpha quality !!!

## Core Features
* A declarative syntax with JavaScript for programming shaders (no need to write in GLSL) !
* Flexible management of GPU resources, functions, and programs.
* Forward and backward compatibility

## Example

```javascript
//Create context
var fxgl = new FlexGL({
    container: document.body,
    width: 800,
    height: 600
});

//Allocate and manage resources
fxgl.attribute('aVertexPos', 'vec2', [-1, 0, 1, 1, 0, -1.0])
    .uniform('uColor', 'vec4', [0.5, 0.0, 0.5, 1.0]);

//Create Program
var simpleDraw = fxgl.createProgram('drawTriangle', {
    vs: function() {
        gl_Position = vec4(this.aVertexPos, 0, 1.0);
    },
    fs: function() {
        gl_FragColor = this.uColor;
    },
    render: function(len) {
        this.drawArrays(this.TRIANGLES, 0, len);
    }
});

simpleDraw(3); // draw triangle

//change vertices and color
fxgl.attribute.aVertexPos = [
    -0.5, -0.5, 0.5, -0.5, -0.5, 0.5,
    -0.5,  0.5, 0.5, -0.5, 0.5, 0.5
];
fxgl.uniform.uColor = [0.0, 0.5, 0.5, 1.0]

simpleDraw(6); // draw rectangle
```
