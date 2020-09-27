export default `
  attribute vec2 position;
  attribute vec2 uv;

  varying vec2 vUv;

  uniform mat4 projection;
  uniform float time;

  void main() {
    vec4 p = vec4(position, 0.0, 1.0);

    vUv = uv;

    gl_Position = projection * p;
  }
`
