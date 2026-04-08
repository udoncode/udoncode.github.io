<script>
import { reactive } from 'vue'

// 전역 커서 상태 관리
const globalCursorState = reactive({
  isHovered: false,
  label: '',
  showPreview: false,
  post: null,
  isTouchDevice: false,
})

// 컴포넌트에서 재사용할 함수
export const useCursor = () => {
  const setHover = (label = '') => {
    globalCursorState.isHovered = true
    globalCursorState.label = label
  }

  const clearHover = () => {
    globalCursorState.isHovered = false
    globalCursorState.label = ''
  }

  const setPreview = (post) => {
    globalCursorState.showPreview = true
    globalCursorState.post = post
  }

  const clearPreview = () => {
    globalCursorState.showPreview = false
    globalCursorState.post = null
  }

  return {
    state: globalCursorState,
    setHover,
    clearHover,
    setPreview,
    clearPreview,
  }
}
</script>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import gsap from 'gsap'

// DOM 요소 접근 ref
const cursorRef = ref(null)
const previewRef = ref(null)

// gsap quickTo 함수
let cursorX, cursorY, previewX, previewY

// 마우스 추적 핸들러
const handleMouseMove = (e) => {
  // 터치 기기 확인
  if (globalCursorState.isTouchDevice) return

  // 커서 위치 업데이트
  if (cursorX && cursorY) {
    cursorX(e.clientX)
    cursorY(e.clientY)
  }

  // 프리뷰 위치 업데이트 (위치 오프셋 우측 하단 이동)
  if (previewX && previewY && globalCursorState.showPreview) {
    previewX(e.clientX + 140)
    previewY(e.clientY + 160)
  }
}

onMounted(() => {
  globalCursorState.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  // PC 환경
  if (!globalCursorState.isTouchDevice) {
    // 요소의 중심을 마우스 좌표로 이동
    gsap.set(cursorRef.value, { xPercent: -50, yPercent: -50 })
    gsap.set(previewRef.value, { opacity: 0, scale: 0.9, xPercent: -50, yPercent: -50 })

    // 부드러운 움직임
    cursorX = gsap.quickTo(cursorRef.value, 'left', { duration: 0.2, ease: 'power3' })
    cursorY = gsap.quickTo(cursorRef.value, 'top', { duration: 0.2, ease: 'power3' })

    previewX = gsap.quickTo(previewRef.value, 'left', { duration: 0.5, ease: 'power3' })
    previewY = gsap.quickTo(previewRef.value, 'top', { duration: 0.5, ease: 'power3' })

    // 이벤트 등록 + 기본 커서 숨기기
    window.addEventListener('mousemove', handleMouseMove)
    document.body.style.cursor = 'none'
  }
})

// 프리뷰 표시/숨김 제어
watch(
  () => globalCursorState.showPreview,
  (isVisible) => {
    if (!previewRef.value) return

    if (isVisible) {
      gsap.to(previewRef.value, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: 'back.out(1.5)',
        overwrite: 'auto',
      })
    } else {
      gsap.to(previewRef.value, {
        opacity: 0,
        scale: 0.9,
        duration: 0.3,
        ease: 'power2.in',
        overwrite: 'auto',
      })
    }
  },
)

// 정리
onBeforeUnmount(() => {
  if (!globalCursorState.isTouchDevice) {
    window.removeEventListener('mousemove', handleMouseMove)
    document.body.style.cursor = 'auto'
  }

  if (previewRef.value) gsap.killTweensOf(previewRef.value)
  if (cursorRef.value) gsap.killTweensOf(cursorRef.value)
})
</script>

<template>
  <div>
    <!-- 커스텀 커서 -->
    <div
      ref="cursorRef"
      class="fixed top-0 left-0 border border-blue-main rounded-full pointer-events-none z-9999 flex items-center justify-center transition-[width,height,background-color,opacity,backdrop-filter] duration-300 ease-out cursor-outline"
      :class="
        globalCursorState.isHovered
          ? 'w-[60px] h-[60px] bg-blue-main/10 backdrop-blur-[2px]'
          : 'w-6 h-6'
      "
      :style="{
        display: globalCursorState.isTouchDevice ? 'none' : 'flex',
        opacity: globalCursorState.showPreview ? 0 : 1,
      }"
    >
      <!-- 정중앙 포인터 (호버 시 글자를 위해 숨김) -->
      <div
        class="absolute w-1.5 h-1.5 bg-blue-main rounded-full dot-outline transition-all duration-300"
        :class="globalCursorState.isHovered ? 'opacity-0 scale-50' : 'opacity-100 scale-100'"
      ></div>

      <!-- 호버 시 나타나는 텍스트 라벨 -->
      <span
        class="absolute font-mono text-[10px] text-blue-main font-bold transition-opacity duration-300 text-outline-white"
        :class="globalCursorState.isHovered ? 'opacity-100' : 'opacity-0'"
      >
        {{ globalCursorState.label }}
      </span>
    </div>

    <!-- 호버 프리뷰 패널 -->
    <div
      ref="previewRef"
      class="fixed top-0 left-0 z-[9998] w-[250px] h-[300px] bg-bg-soft border border-blue-main pointer-events-none p-4 flex flex-col justify-between font-mono text-[12px] shadow-[0_10px_30px_rgba(29,77,255,0.1)]"
      :style="{ display: globalCursorState.isTouchDevice ? 'none' : 'flex' }"
    >
      <template v-if="globalCursorState.post">
        <!-- 제목 영역 -->
        <div class="border-b border-blue-main pb-2 mb-2 font-bold truncate">
          {{ globalCursorState.post.title || 'METADATA_VIEW' }}
        </div>

        <!-- 본문/요약 영역 -->
        <div
          class="flex-grow flex items-center justify-center border border-blue-line bg-blue-main/5 p-4 text-center overflow-hidden"
        >
          <p class="line-clamp-4 leading-relaxed">
            {{ globalCursorState.post.summary || '[ NO METADATA AVAILABLE ]' }}
          </p>
        </div>

        <!-- 푸터 영역 -->
        <div class="pt-3 text-right text-blue-deep/70">READ MORE -&gt;</div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* 커서 테두리 바깥과 안쪽 그림자 */
.cursor-outline {
  box-shadow:
    0 0 0 1px rgba(252, 252, 250, 0.5),
    inset 0 0 0 1px rgba(252, 252, 250, 0.5);
}

/* 중앙 점을 위한 하얀색 아웃라인 */
.dot-outline {
  box-shadow: 0 0 0 1px rgba(252, 252, 250, 0.5);
}

.text-outline-white {
  text-shadow:
    -1px -1px 0 rgba(252, 252, 250, 0.6),
    1px -1px 0 rgba(252, 252, 250, 0.6),
    -1px 1px 0 rgba(252, 252, 250, 0.6),
    1px 1px 0 rgba(252, 252, 250, 0.6);
}
</style>
