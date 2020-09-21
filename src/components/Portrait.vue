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

export default {
  name: 'Portrait',
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

    onMounted(() => {
      carpet.value = aladino.carpet(picture.value, {
        material: aladino.material({
          vertex: `
            attribute vec2 position;
            attribute vec2 uv;

            uniform mat4 projection;
            uniform float time;
            uniform float transform;
            uniform float displacement;
 
            varying vec2 vUv;
            varying float vTransform;
            varying float vDisplacement;

            void main() {
              vec4 p = vec4(position, 0.0, 1.0);

              p.z += sin(uv.x * 1.0 + time * 0.0005) * transform;

              vUv = uv;
              vTransform = transform;
              vDisplacement = displacement;

              gl_Position = projection * p;
            }
          `,
          fragment: `
            precision highp float;

            uniform sampler2D picture;

            varying vec2 vUv;
            varying float vTransform;
            varying float vDisplacement;

            vec4 displace(sampler2D picture, vec2 uv, float dis) {
              float red = texture2D(picture, vec2(uv.x - dis, uv.y + dis)).r;
              float green = texture2D(picture, vec2(uv.x + dis, uv.y - dis)).g;
              float blue = texture2D(picture, vec2(uv.x, uv.y)).b;
              float alpha = texture2D(picture, uv).a;

              return vec4(red, green, blue, alpha); 
            }

            void main() {
              vec2 uv = vUv;
              float dis = vDisplacement;

              vec4 color = displace(picture, uv, dis);

              gl_FragColor = color;
            }
          `,
        }), 
        uniforms: {
          picture: aladino.texture({
            url: picture.value.src,
          }),
          transform: transform.value,
          displacement: displacement.value,
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
    }

    const onLeave = () => {
      // transform.value = 0.0;

      gsap.killTweensOf(displacement)
      gsap.to(displacement, {
        duration: 0.5,
        value: 0.0,
        ease: 'power4.in',
      })
    }

    watch(
      () => [displacement.value, transform.value],
      v => {
        carpet.value.uniforms.displacement = v[0]
        carpet.value.uniforms.transform = v[1]
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
