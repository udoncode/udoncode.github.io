<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  post: {
    type: Object,
    default: null,
  },
  x: {
    type: Number,
    required: true,
  },
  y: {
    type: Number,
    required: true,
  },
})

const previewEl = ref(null)

let setX = null
let setY = null

onMounted(() => {
  if (!previewEl.value) return

  gsap.set(previewEl.value, {
    opacity: 0,
    scale: 0.9,
    xPercent: -50,
    yPercent: -50,
  })

  setX = gsap.quickTo(previewEl.value, 'left', {
    duration: 0.5,
    ease: 'power3',
  })

  setY = gsap.quickTo(previewEl.value, 'top', {
    duration: 0.5,
    ease: 'power3',
  })
})

watch(
  () => [props.x, props.y],
  ([x, y]) => {
    if (!setX || !setY) return
    setX(x)
    setY(y)
  },
)

watch(
  () => props.visible,
  (visible) => {
    if (!previewEl.value) return

    if (visible) {
      gsap.to(previewEl.value, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: 'back.out(1.5)',
        overwrite: 'auto',
      })
    } else {
      gsap.to(previewEl.value, {
        opacity: 0,
        scale: 0.9,
        duration: 0.3,
        ease: 'power2.in',
        overwrite: 'auto',
      })
    }
  },
)

onBeforeUnmount(() => {
  if (previewEl.value) {
    gsap.killTweensOf(previewEl.value)
  }
})
</script>

<template>
  <div
    ref="previewEl"
    class="fixed z-[99] w-[250px] h-[300px] bg-bg-soft border border-blue-main pointer-events-none p-4 flex flex-col justify-between font-mono text-[12px] shadow-[0_10px_30px_rgba(29,77,255,0.1)]"
  >
    <template v-if="post">
      <div class="border-b border-blue-main pb-2 mb-2">
        {{ post?.title }}
      </div>

      <div
        class="flex-grow flex items-center justify-center border border-blue-line bg-blue-main/5"
      >
        {{ post?.summary }}
      </div>

      <div class="pt-2 text-right">READ MORE -&gt;</div>
    </template>
  </div>
</template>
