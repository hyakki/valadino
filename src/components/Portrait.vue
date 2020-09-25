<template>
  <div class="portrait">
    <div class="portrait-inner">
      <img class="portrait__picture"
           :src="src"
           alt="Maxime Parisse Picture"
           ref="picture"
           @mouseover="onOver"
           @mouseleave="onLeave" />
    </div>
  </div>
</template>

<script lang="ts">
import { onMounted, ref, watch } from 'vue'
import aladino from './../scripts/aladino'
import gsap from 'gsap'

import displacementPicture from './../assets/displacement.png'

export default {
  name: 'portrait',
  props: {
    src: {
      type: String, 
      required: true,
    },
  },
  setup(_props, ctx) {
    const picture = ref()
    const carpet = ref()
    const transform = ref(0.0)
    const displacement = ref(0.0)
    const progress = ref(1.0)

    onMounted(() => {
      carpet.value = aladino.carpet(picture.value, {
        material: aladino.material({
          vertex: `
            attribute vec2 position;
            attribute vec2 uv;

            varying vec2 vUv;

            uniform mat4 projection;
            uniform float time;
            uniform float transform;

            void main() {
              vec4 p = vec4(position, 0.0, 1.0);

              p.z += sin(uv.x * 1.0 + time * 0.0005) * transform;

              vUv = uv;

              gl_Position = projection * p;
            }
          `,
          fragment: `
            precision highp float;

            uniform sampler2D picture;
            uniform sampler2D displacementPicture;
            uniform float displacement;
            uniform float progress;
            uniform float time;

            varying vec2 vUv;

            vec4 displaceF(sampler2D picture, vec2 uv, float dis) {
              float red = texture2D(picture, vec2(uv.x - dis, uv.y + dis)).r;
              float green = texture2D(picture, vec2(uv.x + dis, uv.y - dis)).g;
              float blue = texture2D(picture, vec2(uv.x, uv.y)).b;
              float alpha = texture2D(picture, uv).a;

              return vec4(red, green, blue, alpha); 
            }

            void main() {
              // Displacement test
              // vec4 color = displaceF(picture, vUv, progress / 10.0);

              vec4 displace = texture2D(displacementPicture, vUv.yx);
              vec2 displacedUV = vec2(vUv.x, vUv.y);

              displacedUV.y = mix(vUv.y, displace.r - 0.15, progress);

              vec4 color = texture2D(picture, displacedUV);

              float coef = sin(time / 1000.0);

              color.r = texture2D(picture, displacedUV - vec2(0.0, 0.01) * progress * coef).r;
              color.g = texture2D(picture, displacedUV - vec2(0.0, 0.02) * progress * coef).g;
              color.b = texture2D(picture, displacedUV - vec2(0.0, 0.03) * progress * coef).b;

              gl_FragColor = color;
            }
          `,
        }), 
        uniforms: {
          picture: aladino.texture(picture.value.src),
          displacementPicture: aladino.texture(displacementPicture, { nearest: true }),
          transform: transform.value,
          displacement: displacement.value,
          progress: progress.value,
        },
      })
    })

    const onOver = () => {
      // transform.value = 1.0;

      gsap.killTweensOf(displacement)
      gsap.to(displacement, {
        duration: 0.7,
        value: 0.03,
        ease: 'power4.out',
      })

      gsap.killTweensOf(progress)
      gsap.to(progress, {
        duration: 0.3,
        value: 0.0,
        ease: 'power4.out',
      })
    }

    const onLeave = () => {
      // transform.value = 0.0;

      gsap.killTweensOf(displacement)
      gsap.to(displacement, {
        duration: 0.5,
        value: 0.0,
        ease: 'power4.in',
      })

      gsap.killTweensOf(progress)
      gsap.to(progress, {
        duration: 0.2,
        value: 1.0,
        ease: 'power4.in',
      })
    }

    watch(
      () => [displacement.value, transform.value, progress.value],
      v => {
        carpet.value.uniforms.displacement = v[0]
        carpet.value.uniforms.transform = v[1]
        carpet.value.uniforms.progress = v[2]
      }
    )

    return {
      onLeave,
      onOver,
      picture,
    }
  },
}
</script>

<style>
.portrait-inner {
  position: relative;
  border: 1px solid black;
  cursor: pointer;
}

.portrait-inner::before {
  content: '';
  display: block;
  width: 100%;
  padding-top: 100%;
}

.portrait__picture {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
