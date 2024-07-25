#define PI 3.1415926535897932384626433832795 // Rotation of elements usually require PI

attribute vec3 position;
attribute vec2 uv;

uniform float uSpeed;
uniform vec2 uViewportSizes;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv; 

void main() {
    vUv = uv; 

    vec4 newPosition = modelViewMatrix * vec4(position, 1.0); // Checks to see which part of where your 3D Model is.
    // uSpeed for mouse velocity
    newPosition.z -= (sin(newPosition.y / uViewportSizes.y * PI + PI / 2.0) + sin(newPosition.x / uViewportSizes.x * PI + PI / 2.0)) * abs(uSpeed); // <abs = no matter direction, effect will look the same;

    gl_Position = projectionMatrix * newPosition;
}

// Play around with PI and other values as this is the base for most WebGL websites.