<script setup>
import { onMounted } from 'vue'
import { gsap } from 'gsap'
import AnimatedRobot from '@/svg/AnimatedRobot.vue'
import AnimatedStar from '@/svg/AnimatedStar.vue'

// 날짜 포맷팅
const date = new Date()
const year = date.getFullYear()
const month = String(date.getMonth() + 1).padStart(2, '0')
const day = String(date.getDate()).padStart(2, '0')

// GSAP 애니메이션 초기화
onMounted(() => {
  const tl = gsap.timeline()

  // 1. 메타 정보, 별 배경, 스크롤 인디케이터 페이드 인
  tl.fromTo(
    '.gsap-fade-in',
    { opacity: 0, y: 10 },
    { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: 'power2.out', delay: 0.2 },
  )

  // 2. 타이포그래피 애니메이션 (밑에서 위로 등장)
  tl.to(
    '.reveal-text',
    {
      y: '0%',
      duration: 1.2,
      stagger: 0.15,
      ease: 'power4.out',
      onComplete: () => {
        // 애니메이션이 끝나면 글씨가 잘리지 않도록 overflow 해제
        gsap.set('.reveal-overflow', { overflow: 'visible' })
      },
    },
    '-=0.8', // 앞의 애니메이션이 끝나기 0.8초 전에 미리 시작
  )

  // 3. 로봇 애니메이션 (스케일 변화)
  tl.fromTo(
    '.robot-wrapper',
    { opacity: 0, scale: 0.2 },
    {
      opacity: 1,
      scale: 1,
      duration: 1.5,
      ease: 'elastic.out(1.2, 0.5)', // 탄성, 진동 횟수
    },
    '-=0.7',
  )
})
</script>

<template>
  <section class="min-h-[85vh] flex flex-col justify-between px-4 lg:px-8 overflow-hidden">
    <!-- 상단 메타 정보 -->
    <div
      class="flex justify-between items-start font-mono text-xs border-b border-blue-main pb-4 mt-8 gsap-fade-in opacity-0"
    >
      <div>
        <p>DATE: {{ year }}-{{ month }}-{{ day }}</p>
        <p>SYSTEM: V.1.0</p>
      </div>
      <div class="text-right">
        <p>푸르른 미래를 위한</p>
        <p>개발 학습 일지 아카이브</p>
      </div>
    </div>

    <!-- 코어 (타이틀, 별, 로봇) -->
    <div class="grow flex flex-col items-center justify-center py-8 md:py-12 text-center relative">
      <div class="relative flex flex-col items-center z-10 w-full max-w-6xl mx-auto">
        <!-- 별 컴포넌트 배경 배치 -->
        <div
          class="absolute left-[-15%] top-[15%] w-48 h-48 md:w-100 md:h-100 text-blue-main/5 pointer-events-none -z-10 opacity-0 gsap-fade-in hidden sm:block"
        >
          <AnimatedStar animationType="slow" strokeWidth="4" />
        </div>
        <div
          class="absolute left-[2%] md:left-[12%] top-[5%] w-16 h-16 md:w-24 md:h-24 text-blue-main pointer-events-none -z-10 opacity-0 gsap-fade-in hidden sm:block"
        >
          <AnimatedStar animationType="normal" strokeWidth="8" />
        </div>
        <div
          class="absolute right-[5%] md:right-[18%] top-[-2%] w-8 h-8 md:w-12 md:h-12 text-blue-main/80 pointer-events-none -z-10 opacity-0 gsap-fade-in hidden sm:block"
        >
          <AnimatedStar animationType="fast" strokeWidth="12" />
        </div>
        <div
          class="absolute right-[-2%] md:right-[5%] bottom-[25%] w-12 h-12 md:w-20 md:h-20 text-blue-main pointer-events-none -z-10 opacity-0 gsap-fade-in hidden sm:block"
        >
          <AnimatedStar animationType="reverse" strokeWidth="8" />
        </div>
        <div
          class="absolute left-[15%] md:left-[22%] bottom-[10%] w-6 h-6 md:w-8 md:h-8 text-blue-main/60 pointer-events-none -z-10 opacity-0 gsap-fade-in hidden sm:block"
        >
          <AnimatedStar animationType="normal" strokeWidth="16" />
        </div>

        <!-- 메인 타이틀 -->
        <div class="reveal-overflow block">
          <div
            class="reveal-text font-hero font-bold text-[clamp(4rem,2.5rem+7vw,7.5rem)] leading-tight tracking-[-0.05em] whitespace-nowrap px-4 py-2 transform translate-y-[110%]"
          >
            아른한 기억
          </div>
        </div>
        <div class="reveal-overflow block -mt-4 md:-mt-6 lg:-mt-8">
          <div
            class="reveal-text font-hero font-bold text-[clamp(4.5rem,1rem+12vw,10rem)] leading-none tracking-[-0.08em] whitespace-nowrap px-4 py-2 transform translate-y-[110%]"
          >
            또렷한 기록
          </div>
        </div>

        <!-- 서브 텍스트 -->
        <div class="reveal-overflow block mt-6 md:mt-10">
          <div class="reveal-text flex flex-col items-center gap-6 transform translate-y-[110%]">
            <p
              class="max-w-[680px] font-hangang uppercase text-[clamp(1.2rem,0.8rem+1.5vw,2rem)] lg:mt-2 leading-[1.45]"
            >
              생각을 포기하면 그 순간이 바로 시합 종료.
            </p>

            <div class="flex gap-6 font-mono text-xs uppercase leading-relaxed text-blue-deep/75">
              <p>Backend Developer</p>
              <p>based in South Korea</p>
            </div>
          </div>
        </div>

        <!-- 로봇 -->
        <div class="mt-8 md:mt-12 w-full flex items-center justify-center">
          <div class="robot-wrapper opacity-0">
            <AnimatedRobot />
          </div>
        </div>
      </div>
    </div>

    <!-- 하단 스크롤 인디케이터 -->
    <div
      class="flex justify-between items-end border-t border-blue-main pt-4 font-mono text-xs uppercase gsap-fade-in opacity-0"
    >
      <p>Scroll to explore</p>
      <div class="w-px h-12 bg-blue-main relative overflow-hidden">
        <div
          class="absolute top-0 left-0 w-full h-full bg-bg-soft transform -translate-y-full animate-scrolldown"
        ></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.reveal-overflow {
  overflow: hidden;
  display: inline-block;
  vertical-align: top;
}

.animate-scrolldown {
  animation: scrolldown 1.5s ease-in-out infinite;
}

@keyframes scrolldown {
  0% {
    transform: translateY(-100%);
  }
  50% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(100%);
  }
}
</style>
