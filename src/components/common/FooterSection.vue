<script setup>
import { onMounted, ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCursor } from './CustomCursor.vue'

const { setHover, clearHover } = useCursor()

// GSAP ScrollTrigger 사용을 위한 등록
gsap.registerPlugin(ScrollTrigger)

// 접근 요소 ref
const footerContainerRef = ref(null)
const footerTextRef = ref(null)

onMounted(() => {
  // 푸터 텍스트 패럴랙스 애니메이션
  gsap.to(footerTextRef.value, {
    scrollTrigger: {
      trigger: footerContainerRef.value,
      start: 'top bottom',
      end: 'bottom bottom',
      scrub: 1, // 스크롤에 맞춰 부드럽게 움직임
    },
    y: 0,
    ease: 'none',
  })
})
</script>

<template>
  <footer
    ref="footerContainerRef"
    class="border-t border-blue-main bg-blue-main text-bg-soft pt-12 pb-4 px-4 lg:px-8 overflow-hidden mt-12"
  >
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
      <div class="max-w-md">
        <p class="font-batang select-none text-sm mb-4 leading-relaxed">
          이곳은 도구에 휘둘리지 않기 위해 기본기를 다지고, <br />
          단단한 뿌리를 내리고자 기록해 나가는 <br />
          한 개발자의 아카이브입니다.
        </p>
        <div class="flex gap-4 font-mono text-xs uppercase">
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:underline underline-offset-4 interactive z-10"
            @mouseenter="setHover('LINK')"
            @mouseleave="clearHover"
            >Github</a
          >
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:underline underline-offset-4 interactive z-10"
            @mouseenter="setHover('LINK')"
            @mouseleave="clearHover"
            >Email</a
          >
        </div>
      </div>
      <div class="font-mono select-none text-xs text-right">
        <p>&copy; 2026 Udoncode</p>
        <p>All systems operational.</p>
      </div>
    </div>

    <h2
      ref="footerTextRef"
      class="font-hero select-none text-[15vw] leading-[0.7] tracking-tighter m-0 p-0 transform translate-y-4"
    >
      Home
    </h2>
  </footer>
</template>

<style scoped></style>
