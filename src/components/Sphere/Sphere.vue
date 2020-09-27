<template>
  <div
    class="sphere"
    @mousemove="mouseMoveHandler"
    @mousedown="mouseDownHandler"
    @mouseup="mouseUpHandler"
    @mouseleave="mouseUpHandler"
  >
    <div class="sphere-inner">
      <div class="sphere__canvas" ref="canvas"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { onMounted, ref, watch } from "vue"
import aladino from "./../../scripts/aladino"
import material from './material'
import gsap from 'gsap'

export default {
  name: "sphere",
  setup() {
    const canvas = ref()
    const carpet = ref()
    const mouse = ref({ x: 0, y: 0 })
    const progress = ref(0.0)

    onMounted(() => {
      carpet.value = aladino.carpet(canvas.value, {
        material,
        uniforms: {
					mouse: [mouse.value.x, mouse.value.y],
          progress: progress.value,
				},
      })
    })

    const mouseDownHandler = e => {
      gsap.killTweensOf(progress)
      gsap.to(progress, {
        duration: 1.0,
        value: 1.0,
        ease: "elastic.out(1.2, 0.7)",
      })
    }

    const mouseUpHandler = e => {
      gsap.killTweensOf(progress)
      gsap.to(progress, {
        duration: 1.0,
        value: 0.0,
        ease: 'power4.easeIn,'
      })
    }

    const mouseMoveHandler = e => {
      const { clientX, clientY } = e

			mouse.value = {
				x: ((clientX / 650) * 2.0) - 1.0,
				y: 1.0 - ((clientY / 650) * 2.0),
			}
    }

    watch(
      () => [mouse.value, progress.value],
      v => {
        carpet.value.uniforms.mouse = [v[0].x, v[0].y]
        carpet.value.uniforms.progress = v[1]
      }
    )

    return {
      canvas,
      mouseDownHandler,
      mouseUpHandler,
      mouseMoveHandler,
    }
  },
}
</script>

<style>
.sphere {
  cursor: pointer;
}

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
