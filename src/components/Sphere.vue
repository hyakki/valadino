<template>
  <div class="sphere" @mousemove="mouseMoveHandler">
    <div class="sphere-inner">
      <div class="sphere__canvas" ref="canvas"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { onMounted, ref, watch } from "vue"
import aladino from "./../scripts/aladino"

export default {
  name: "sphere",
  setup() {
    const canvas = ref()
    const carpet = ref()
    const mouse = ref({ x: 0, y: 0 })

    onMounted(() => {
      carpet.value = aladino.carpet(canvas.value, {
        material: aladino.material({
          vertex: `
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
          `,
          fragment: `
            precision highp float;

            uniform float time;
						uniform float mouseX;
						uniform float mouseY;

            varying vec2 vUv;

            float rad = 0.5;

            vec3 getColor(float t) {
							vec3 a = vec3(0.1, 0.0, 0.2);
							vec3 b = vec3(0.7, 0.3, 0.6);
							vec3 c = vec3(0.0, 0.9, 0.1);
							vec3 d = vec3(0.9, 0.9, 0.9);

              vec3 color = a + b * cos(6.28319 * (c + t * d)); 

              return color;
            }

            float sdSphere( vec3 p, float s ) {
              return length(p) - s;
            }

            // float sineCrazy(vec3 p) {
            //   return (sin(p.x) + sin(p.y) + sin(p.z)) / 3.0;
            // }

            float sineCrazy(vec3 p) {
              return sin(p.x) - sin(p.z) + sin(p.y); 
            }

            vec3 getNormal(vec3 p, float r) {
              vec2 o = vec2(0.001, 0.0);
              return normalize(
                vec3(
                  sdSphere(p + o.xyy, r) - sdSphere(p - o.xyy, r),
                  sdSphere(p + o.yxy, r) - sdSphere(p - o.yxy, r),
                  sdSphere(p + o.yyx, r) - sdSphere(p - o.yyx, r)
                )
              );
            }

            float scene(vec3 p) {
              float scale = 50.0 + 20.0 * sin( time / 2000.0);

              return max(sdSphere(p, rad), sineCrazy(p * scale) / scale); 
            }

            void main() {
              // vec2 newUV = gl_FragCoord.xy / resolution.xy;
              vec2 newUV = vUv;

              vec2 p = newUV - vec2(0.5);
              // p.x *= resolution.x/resolution.y;

							p.x += mouseX / 60.0;

              vec3 camPos = vec3(0.0, 0.0, 2.0);

              vec3 ray = normalize(vec3(p, -1.0));
              vec3 rayPos = camPos;
              float curDist = 0.0;
              float rayLen = 0.0;
              vec3 light = vec3(-1.0, 1.0, 1.0);
              vec3 color = vec3(0.0);

              for(int i = 0; i <= 64; i++) {
                curDist = scene(rayPos);
                rayLen += curDist;
                rayPos = camPos + (ray * rayLen);

                if (abs(curDist) < 0.001) {
                  vec3 n = getNormal(rayPos, rad);
                  float diff = dot(n, light);

                  color = getColor(rayLen) + (getColor(diff) / 1.8);
									break;
                }
              }

              gl_FragColor = vec4(color, 1.0 );
            }
          `,
        }),
        uniforms: {
					mouseX: mouse.value.x,
					mouseY: mouse.value.y,
				},
      })
    })

    const mouseMoveHandler = e => {
      const { clientX, clientY } = e

			mouse.value = {
				x: ((clientX / 650) * 2.0) - 1.0,
				y: clientY
			}
    }

    watch(
      () => [mouse.value],
      (v) => {
				console.log(v[0])
        carpet.value.uniforms.mouseX = v[0].x
        carpet.value.uniforms.mouseY = v[0].y
      }
    )

    return {
      canvas,
      mouseMoveHandler,
    }
  },
}
</script>

<style>
.sphere-inner {
  position: relative;
}

.sphere-inner::before {
  content: "";
  display: block;
  width: 100%;
  padding-top: 100%;
}

.sphere__canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
