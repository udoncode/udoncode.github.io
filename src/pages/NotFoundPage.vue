<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { gsap } from 'gsap'
import { TextPlugin } from 'gsap/TextPlugin'

// TextPlugin 등록
gsap.registerPlugin(TextPlugin)

// DOM 요소 접근을 위한 ref 설정
const errorTextRef = ref(null)
const terminalRef = ref(null)
const buttonsRef = ref(null)

const type1Ref = ref(null)
const type2Ref = ref(null)
const type3Ref = ref(null)
const type4Ref = ref(null)

let handleMouseMove

onMounted(() => {
  // 1. 마우스 패럴랙스(Parallax) 효과
  // quickTo로 값만 부드럽게 갱신
  const moveX = gsap.quickTo(errorTextRef.value, 'x', { duration: 1, ease: 'power3.out' })
  const moveY = gsap.quickTo(errorTextRef.value, 'y', { duration: 1, ease: 'power3.out' })

  handleMouseMove = (e) => {
    // 화면 중심을 기준점으로 좌표 설정
    const x = e.clientX - window.innerWidth / 2
    const y = e.clientY - window.innerHeight / 2
    // 마우스 반대 방향으로 살짝 이동
    moveX(x * -0.05)
    moveY(y * -0.05)
  }

  window.addEventListener('mousemove', handleMouseMove)

  // 2. 초기 등장 애니메이션 및 타이핑 효과 타임라인
  const tl = gsap.timeline()

  // 터미널과 버튼 페이드 업
  tl.to([terminalRef.value, buttonsRef.value], {
    opacity: 1,
    y: 0,
    duration: 1,
    stagger: 0.2,
    ease: 'power3.out',
  })

  // 터미널 텍스트 타이핑 효과
  tl.to(
    type1Ref.value,
    {
      text: 'Microsoft Windows [Version 10.0.22631.1]',
      duration: 1,
      ease: 'none',
    },
    '-=0.2',
  )
    .to(type2Ref.value, {
      text: '(c) 2026 Udoncode. All rights reserved.',
      duration: 1.2,
      ease: 'none',
    })
    .to(type3Ref.value, {
      text: 'C:\\SYSTEM> UDONCODE.exe --search "Requested_Document"',
      duration: 1.5,
      ease: 'none',
    })
    .to(type4Ref.value, {
      text: 'FATAL ERROR: 404 NOT FOUND. The requested page has been misplaced.',
      duration: 2,
      ease: 'none',
    })
})

// 이벤트 리스너 해제
onUnmounted(() => {
  if (handleMouseMove) {
    window.removeEventListener('mousemove', handleMouseMove)
  }
})
</script>

<template>
  <main
    class="flex-grow flex flex-col items-center justify-center pt-24 pb-20 px-4 w-full relative z-10"
  >
    <!-- 404 -->
    <div ref="errorTextRef" class="text-center w-full pointer-events-none mb-4">
      <h1
        class="font-namsan text-[clamp(10rem,25vw,25rem)] leading-tight text-outline tracking-tighter select-none m-0"
      >
        404
      </h1>
    </div>

    <!-- 터미널 -->
    <div
      ref="terminalRef"
      class="relative z-20 w-full max-w-3xl border border-blue-main bg-bg-soft shadow-[16px_16px_0px_rgba(29,77,255,0.15)] flex flex-col opacity-0 translate-y-8"
    >
      <!-- 터미널 제목 -->
      <div
        class="flex justify-between items-center bg-blue-main text-bg-soft px-4 py-2 font-mono text-xs uppercase tracking-widest border-b border-blue-main select-none"
      >
        <div class="flex items-center gap-3">
          <span class="w-2 h-2 bg-bg-soft rounded-full animate-pulse"></span>
          <span>C:\SYSTEM\ARCHIVE\404.EXE</span>
        </div>
        <!-- 가짜 창 버튼 -->
        <div class="flex gap-2 items-center">
          <div
            class="w-3 h-3 border border-bg-soft flex items-end justify-center pb-1 text-[8px] cursor-not-allowed opacity-70"
          >
            _
          </div>
          <div
            class="w-3 h-3 border border-bg-soft flex items-center justify-center text-[8px] cursor-not-allowed opacity-70"
          >
            □
          </div>
          <div
            class="w-3 h-3 border border-bg-soft flex items-center justify-center text-[10px] leading-none cursor-not-allowed hover:bg-bg-soft hover:text-blue-main transition-colors"
          >
            ×
          </div>
        </div>
      </div>

      <!-- 터미널 바디 -->
      <div
        class="p-6 md:p-10 font-mono text-sm md:text-base text-blue-deep leading-[1.8] min-h-[250px] md:min-h-[300px]"
      >
        <!-- 텍스트 공간 미리 확보 -->
        <p ref="type1Ref" class="min-h-[1.8em]"></p>
        <p ref="type2Ref" class="min-h-[1.8em] mb-4"></p>
        <p ref="type3Ref" class="min-h-[1.8em] text-blue-main font-bold"></p>
        <p ref="type4Ref" class="min-h-[1.8em] blinking-cursor"></p>
      </div>
    </div>

    <!-- 액션 버튼 -->
    <div
      ref="buttonsRef"
      class="mt-12 flex flex-wrap gap-4 justify-center opacity-0 translate-y-8 z-20 relative"
    >
      <RouterLink to="/" class="error-chip interactive" data-cursor="HOME">
        Return to Home
      </RouterLink>
    </div>
  </main>
</template>

<style scoped>
/* 404 아웃라인 */
.text-outline {
  color: transparent;
  -webkit-text-stroke: 2px rgba(29, 77, 255, 0.15);
  transition: -webkit-text-stroke 0.5s ease;
}
.text-outline:hover {
  -webkit-text-stroke: 2px rgba(29, 77, 255, 0.3);
}

/* 커서 깜빡임 */
.blinking-cursor::after {
  content: '█';
  animation: blink 1s step-start infinite;
  color: #1d4dff;
  margin-left: 4px;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

.error-chip {
  display: inline-block;
  padding: 0.5rem 1.5rem;
  border: 1px solid #1d4dff;
  font-family: 'JetBrains Mono', 'CloudSansCode', monospace;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  transition: all 0.3s ease;
  background: transparent;
  color: #1d4dff;
  border-radius: 0;
}

.error-chip:hover {
  background-color: #1d4dff;
  color: #fcfcfa;
  transform: translateY(-2px);
  box-shadow: 4px 4px 0 rgba(29, 77, 255, 0.2);
}
</style>
