<script>
import { reactive } from 'vue'

// 전역 커서 상태 관리
const globalCursorState = reactive({
  isHovered: false,
  isTextHovered: false,
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

  const setTextHover = (state = true) => {
    globalCursorState.isTextHovered = state
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
    setTextHover,
    setPreview,
    clearPreview,
  }
}
</script>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import gsap from 'gsap'
import { useRoute } from 'vue-router'

// DOM 요소 접근 ref
const cursorRef = ref(null)
const previewRef = ref(null)

// 라우트 객체 가져오기
const route = useRoute()

// 경로가 변경될 때마다 커서 상태 초기화
watch(
  () => route.path,
  () => {
    globalCursorState.showPreview = false
    globalCursorState.isHovered = false
    globalCursorState.isTextHovered = false
    globalCursorState.label = ''
    globalCursorState.post = null
    lastTarget = null // 타겟 캐시도 초기화
  },
)

// 호버 상태가 켜지면 텍스트 드래그 커서는 강제 종료 (우선순위 부여)
watch(
  () => globalCursorState.isHovered,
  (isHovered) => {
    if (isHovered) globalCursorState.isTextHovered = false
  },
)

// gsap quickTo 함수
let cursorX, cursorY, previewX, previewY
let lastTarget = null // 이전 마우스 타겟 캐싱

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

  let target = e.target

  if (target && target !== lastTarget) {
    lastTarget = target

    // 이미 명시적인 호버(isHovered) 이벤트 발생 중이라면 텍스트 감지 무시
    if (globalCursorState.isHovered) {
      globalCursorState.isTextHovered = false
      return
    }

    // 1. 상호작용 요소 감지 (이 위에서는 텍스트 커서 금지)
    const isInteractive = target.closest(
      'a, button, [role="button"], input[type="button"], input[type="submit"], svg, .select-none',
    )

    if (isInteractive) {
      globalCursorState.isTextHovered = false
    } else {
      // 2. 텍스트를 포함하는 태그인지 검사
      const textTags = [
        'P',
        'H1',
        'H2',
        'H3',
        'H4',
        'H5',
        'H6',
        'SPAN',
        'LI',
        'TD',
        'TH',
        'LABEL',
        'INPUT',
        'TEXTAREA',
        'STRONG',
        'EM',
        'B',
        'I',
      ]
      const isTextElement = textTags.includes(target.tagName)

      // 자식 노드 중에 직접적인 텍스트가 있는지 확인
      let hasDirectText = false
      if (!isTextElement && target.childNodes) {
        for (let i = 0; i < target.childNodes.length; i++) {
          const node = target.childNodes[i]
          if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim().length > 0) {
            hasDirectText = true
            break
          }
        }
      }

      // 명시적으로 커서를 텍스트로 지정한 경우
      const isDataCursorText = target.dataset && target.dataset.cursor === 'text'

      globalCursorState.isTextHovered = isTextElement || hasDirectText || isDataCursorText
    }
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
    cursorX = gsap.quickTo(cursorRef.value, 'left', { duration: 0.15, ease: 'power3' })
    cursorY = gsap.quickTo(cursorRef.value, 'top', { duration: 0.15, ease: 'power3' })

    previewX = gsap.quickTo(previewRef.value, 'left', { duration: 0.5, ease: 'power3' })
    previewY = gsap.quickTo(previewRef.value, 'top', { duration: 0.5, ease: 'power3' })

    // 이벤트 등록
    window.addEventListener('mousemove', handleMouseMove)
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
  }

  if (previewRef.value) gsap.killTweensOf(previewRef.value)
  if (cursorRef.value) gsap.killTweensOf(cursorRef.value)
})
</script>

<template>
  <div>
    <!-- 커스텀 커서 루트 -->
    <div
      ref="cursorRef"
      class="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center transition-all duration-200 ease-out"
      :class="[
        /* 단일 요소가 상황에 따라 모양과 테두리를 바뀜 */
        globalCursorState.isHovered
          ? 'w-[60px] h-[60px] bg-blue-main/10 backdrop-blur-[2px] border border-blue-main rounded-full shadow-[0_0_0_1px_rgba(252,252,250,0.5),inset_0_0_0_1px_rgba(252,252,250,0.5)]'
          : globalCursorState.isTextHovered
            ? 'w-[1.5px] h-[24px] bg-blue-main border-transparent rounded-[1px] shadow-[0_0_0_1px_rgba(252,252,250,0.6)]'
            : 'w-6 h-6 border border-blue-main rounded-full shadow-[0_0_0_1px_rgba(252,252,250,0.5),inset_0_0_0_1px_rgba(252,252,250,0.5)]',
      ]"
      :style="{
        display: globalCursorState.isTouchDevice ? 'none' : 'flex',
        opacity: globalCursorState.showPreview ? 0 : 1,
      }"
    >
      <!-- 정중앙 포인터 점 (텍스트나 호버 상태일 땐 완전히 숨김) -->
      <div
        class="absolute w-1.5 h-1.5 bg-blue-main rounded-full transition-all duration-200 shadow-[0_0_0_1px_rgba(252,252,250,0.5)]"
        :class="
          globalCursorState.isHovered || globalCursorState.isTextHovered
            ? 'opacity-0 scale-0'
            : 'opacity-100 scale-100'
        "
      ></div>

      <!-- 호버 시 나타나는 텍스트 라벨 -->
      <span
        class="absolute font-mono text-[10px] text-blue-main font-bold transition-opacity duration-200"
        style="
          text-shadow:
            -1px -1px 0 rgba(252, 252, 250, 0.6),
            1px -1px 0 rgba(252, 252, 250, 0.6),
            -1px 1px 0 rgba(252, 252, 250, 0.6),
            1px 1px 0 rgba(252, 252, 250, 0.6);
        "
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
