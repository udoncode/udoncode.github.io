<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'
import { TextPlugin } from 'gsap/TextPlugin'

// TextPlugin 등록
gsap.registerPlugin(TextPlugin)

// 라우터 설정
const router = useRouter()

// DOM 요소 접근을 위한 ref 설정
const errorTextRef = ref(null)
const terminalRef = ref(null)
const buttonsRef = ref(null)

const type1Ref = ref(null)
const type2Ref = ref(null)
const type3Ref = ref(null)
const type4Ref = ref(null)

let handleMouseMove

// 뒤로가기 기능
const goBack = () => {
  router.back()
}

onMounted(() => {
  // 1. 마우스 패럴랙스(Parallax) 효과
  const moveX = gsap.quickTo(errorTextRef.value, 'x', { duration: 1, ease: 'power3.out' })
  const moveY = gsap.quickTo(errorTextRef.value, 'y', { duration: 1, ease: 'power3.out' })

  handleMouseMove = (e) => {
    const x = e.clientX - window.innerWidth / 2
    const y = e.clientY - window.innerHeight / 2
    moveX(x * -0.05)
    moveY(y * -0.05)
  }

  // 데스크톱 환경에서만 마우스 이벤트 등록 (터치 디바이스 제외)
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('mousemove', handleMouseMove)
  }

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
    class="flex-grow flex flex-col items-center justify-center pt-16 md:pt-24 pb-16 md:pb-20 px-4 md:px-6 w-full relative z-10 overflow-hidden"
  >
    <!-- 404 배경 텍스트 -->
    <div ref="errorTextRef" class="text-center w-full pointer-events-none mb-2 md:mb-4">
      <h1
        class="font-namsan text-[clamp(6rem,20vw,25rem)] leading-tight text-outline tracking-tighter select-none m-0"
      >
        404
      </h1>
    </div>

    <!-- 터미널 -->
    <div
      ref="terminalRef"
      class="relative z-20 w-full max-w-3xl border border-blue-main bg-bg-soft shadow-[8px_8px_0px_rgba(29,77,255,0.15)] md:shadow-[16px_16px_0px_rgba(29,77,255,0.15)] flex flex-col opacity-0 translate-y-8"
    >
      <!-- 터미널 제목 -->
      <div
        class="flex justify-between items-center bg-blue-main text-bg-soft px-3 md:px-4 py-2 font-mono text-[10px] md:text-xs uppercase tracking-widest border-b border-blue-main select-none"
      >
        <div class="flex items-center gap-2 md:gap-3 truncate pr-2">
          <span
            class="min-w-[6px] w-[6px] h-[6px] md:min-w-[8px] md:w-2 md:h-2 bg-bg-soft rounded-full animate-pulse"
          ></span>
          <span class="truncate">C:\SYSTEM\ARCHIVE\404.EXE</span>
        </div>
        <!-- 가짜 창 버튼 -->
        <div class="flex gap-1.5 md:gap-2 items-center shrink-0">
          <div
            class="w-2.5 h-2.5 md:w-3 md:h-3 border border-bg-soft flex items-end justify-center pb-[2px] md:pb-1 text-[6px] md:text-[8px] cursor-not-allowed opacity-70"
          >
            _
          </div>
          <div
            class="w-2.5 h-2.5 md:w-3 md:h-3 border border-bg-soft flex items-center justify-center text-[6px] md:text-[8px] cursor-not-allowed opacity-70"
          >
            □
          </div>
          <div
            class="w-2.5 h-2.5 md:w-3 md:h-3 border border-bg-soft flex items-center justify-center text-[8px] md:text-[10px] leading-none cursor-not-allowed hover:bg-bg-soft hover:text-blue-main transition-colors"
          >
            ×
          </div>
        </div>
      </div>

      <!-- 터미널 바디 -->
      <div
        class="p-4 sm:p-6 md:p-10 font-mono text-xs sm:text-sm md:text-base text-blue-deep leading-[1.6] md:leading-[1.8] min-h-[200px] sm:min-h-[250px] md:min-h-[300px] break-words"
      >
        <!-- 텍스트 공간 미리 확보 -->
        <p ref="type1Ref" class="min-h-[1.6em] md:min-h-[1.8em]"></p>
        <p ref="type2Ref" class="min-h-[1.6em] md:min-h-[1.8em] mb-3 md:mb-4"></p>
        <p ref="type3Ref" class="min-h-[1.6em] md:min-h-[1.8em] text-blue-main font-bold"></p>
        <p ref="type4Ref" class="min-h-[1.6em] md:min-h-[1.8em] blinking-cursor"></p>
      </div>
    </div>

    <!-- 액션 버튼 -->
    <div
      ref="buttonsRef"
      class="mt-8 md:mt-12 flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 justify-center w-full max-w-[280px] sm:max-w-none mx-auto opacity-0 translate-y-8 z-20 relative"
    >
      <button
        @click="goBack"
        class="error-chip interactive w-full sm:w-auto text-center"
        data-cursor="BACK"
      >
        Go Back
      </button>
      <RouterLink
        to="/"
        class="error-chip interactive w-full sm:w-auto text-center"
        data-cursor="HOME"
      >
        Return to Home
      </RouterLink>
    </div>
  </main>
</template>

<style scoped>
.text-outline {
  color: transparent;
  -webkit-text-stroke: 1px rgba(29, 77, 255, 0.15);
  transition: -webkit-text-stroke 0.5s ease;
}
@media (min-width: 768px) {
  .text-outline {
    -webkit-text-stroke: 2px rgba(29, 77, 255, 0.15);
  }
}
.text-outline:hover {
  -webkit-text-stroke: 1.5px rgba(29, 77, 255, 0.3);
}
@media (min-width: 768px) {
  .text-outline:hover {
    -webkit-text-stroke: 2px rgba(29, 77, 255, 0.3);
  }
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1.5rem;
  border: 1px solid #1d4dff;
  font-family: 'JetBrains Mono', 'CloudSansCode', monospace;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  transition: all 0.3s ease;
  background: transparent;
  color: #1d4dff;
  border-radius: 0;
}

@media (min-width: 768px) {
  .error-chip {
    font-size: 0.85rem;
    padding: 0.5rem 1.5rem;
  }
}

.error-chip:hover {
  background-color: #1d4dff;
  color: #fcfcfa;
  transform: translateY(-2px);
  box-shadow: 4px 4px 0 rgba(29, 77, 255, 0.2);
}

.error-chip:active {
  transform: translateY(0);
  box-shadow: 2px 2px 0 rgba(29, 77, 255, 0.2);
}
</style>
