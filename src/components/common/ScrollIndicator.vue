<script setup>
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { onBeforeUnmount, onMounted, ref } from 'vue'

gsap.registerPlugin(ScrollTrigger)

// 상태 관리
const isVisible = ref(false)
const progressPercent = ref(0)

// SVG 원 둘레 계산 (반지름 r = 22)
const circumference = 2 * Math.PI * 22
const dashOffset = ref(circumference)

let scrollTriggerInstance = null

onMounted(() => {
  // 문서 전체 높이를 기준으로 스크롤 퍼센트 계산
  scrollTriggerInstance = ScrollTrigger.create({
    trigger: document.documentElement,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      // 1. 화면 표시 여부 (스크롤 100px 이상 내렸을 때 등장)
      isVisible.value = self.scroll() > 100

      // 2. 퍼센트 텍스트 업데이트
      progressPercent.value = Math.round(self.progress * 100)

      // 3. SVG 라인 채우기 계산
      dashOffset.value = circumference - self.progress * circumference
    }
  })
})

onBeforeUnmount(() => {
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill()
  }
})
</script>

<template>
  <div
    class="fixed top-24 right-4 lg:right-8 z-40 pointer-events-none transition-all duration-500 ease-out flex items-center justify-center w-12 h-12 bg-bg-soft/80 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgba(29,77,255,0.15)] border border-blue-line"
    :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'"
  >
    <svg class="absolute w-full h-full transform -rotate-90" viewBox="0 0 48 48">
      <circle
        cx="24"
        cy="24"
        r="22"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        class="text-blue-main/20"
      />
      <circle
        cx="24"
        cy="24"
        r="22"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        class="text-blue-main transition-all duration-75 ease-linear"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
      />
    </svg>
    <span class="font-sans font-bold text-[10px] text-blue-main tracking-tighter">
      {{ progressPercent }}%
    </span>
  </div>
</template>

<style scoped></style>
