<template>
  <Portrait class="app__portrait" :src="picture" />
</template>

<style>
.app__portrait {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100vw;
  transform: translate(-50%, -50%);
}

@media screen and (orientation: landscape){
  .app__portrait {
    width: 100vh;
  }
}
</style>

<script lang="ts">
import aladino from './scripts/aladino'
import { onMounted, ref } from 'vue'
import Portrait from './components/Portrait.vue'

import picture from './assets/max.jpg'

export default {
  name: 'App',
  components: {
    Portrait,
  },
  setup() {
    onMounted(() => {
      document.body.appendChild(aladino.canvas)
    })

    return {
      picture, 
    }
  },
}
</script>
