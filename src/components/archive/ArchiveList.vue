<script setup>
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCursor } from '@/components/common/CustomCursor.vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { posts as allPosts } from '@/data/posts.js'
import { formatDate } from '@/utils/formatDate.js'

// GSAP 스크롤 트리거 플러그인 등록
gsap.registerPlugin(ScrollTrigger)

// 커스텀 커서
const { setHover, clearHover, setPreview, clearPreview } = useCursor()

// 데이터 및 페이지네이션 상태 관리
const POSTS_PER_PAGE = 7 // 한 페이지당 보여줄 글 개수
const currentPage = ref(1) // 현재 페이지
const activeCategory = ref('All') // 활성화된 카테고리

// 동적 카테고리 생성
const categories = computed(() => {
  const cats = allPosts.map((post) => post.category).filter(Boolean) // 빈 값 제거
  return ['All', ...new Set(cats)] // 중복 제거
})

// 카테고리 필터링된 포스트 목록
const filteredPosts = computed(() => {
  let filtered = allPosts
  if (activeCategory.value !== 'All') {
    filtered = filtered.filter((post) => post.category === activeCategory.value)
  }
  // 날짜 기준 내림차순(최신순) 정렬
  return filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
})

// 전체 페이지 수 계산
const totalPages = computed(() => {
  return Math.ceil(filteredPosts.value.length / POSTS_PER_PAGE) || 1
})

// 현재 페이지에 보여줄 포스트 목록
const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * POSTS_PER_PAGE
  const end = start + POSTS_PER_PAGE
  return filteredPosts.value.slice(start, end)
})

// 이벤트 핸들러
const changeCategory = (category) => {
  activeCategory.value = category
  currentPage.value = 1 // 카테고리가 바뀌면 1페이지로 리셋
}
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

// 추적할 트리거 요소
let scrollTriggers = []

// 스크롤 애니메이션 초기화 함수
const initListAnimations = () => {
  // 기존 트리거 제거 (페이지/카테고리 변경 상황 대비)
  scrollTriggers.forEach((t) => t.kill())
  scrollTriggers = []

  gsap.utils.toArray('.archive-item').forEach((item) => {
    const trigger = ScrollTrigger.create({
      trigger: item,
      start: 'top 90%',
      animation: gsap.from(item, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      }),
    })
    scrollTriggers.push(trigger)
  })
  ScrollTrigger.refresh()
}

onMounted(async () => {
  // DOM 업데이트 완료까지 대기
  await nextTick()

  const tl = gsap.timeline()

  // 1. 헤더 텍스트 등장 애니메이션
  tl.to('.gsap-reveal-text', {
    y: '0%',
    duration: 1.2,
    stagger: 0.15,
    ease: 'power4.out',
    // 애니메이션 끝나면 CSS 속성 복구
    onComplete: () => gsap.set('.reveal-text-wrapper', { overflow: 'visible' }),
  })

  // 2. 필터 버튼 및 페이지네이션 페이드 인
  tl.to(
    '.gsap-fade-in',
    {
      opacity: 1,
      duration: 1,
      ease: 'power2.out',
    },
    '-=0.8',
  )

  // 3. 리스트 스크롤 트리거 애니메이션
  initListAnimations()
})

// 페이지, 카테고리가 바뀌어 DOM이 다시 그려지면 GSAP 애니메이션 재설정
watch(paginatedPosts, async () => {
  await nextTick()
  initListAnimations()

  // 페이지 이동 시 목록 위쪽으로 살짝 스크롤 올려주기
  window.scrollTo({
    top: document.querySelector('.archive-container').offsetTop - 150,
    behavior: 'smooth',
  })
})

// 애니메이션 정리
onBeforeUnmount(() => {
  scrollTriggers.forEach((t) => t.kill())
})
</script>

<template>
  <main class="pt-32 pb-20 px-4 lg:px-8 max-w-[1600px] mx-auto flex-grow w-full">
    <!-- Archive 헤더 -->
    <header class="mb-16 md:mb-24">
      <div class="overflow-hidden reveal-text-wrapper pt-3">
        <h1
          class="font-namsan font-extrabold text-[clamp(3rem,8vw,8rem)] leading-[0.85] tracking-[-0.05em] uppercase gsap-reveal-text transform translate-y-[110%]"
        >
          Archive
        </h1>
      </div>
      <div class="overflow-hidden reveal-text-wrapper mt-4">
        <p
          class="font-mono text-sm md:text-base uppercase gsap-reveal-text transform translate-y-[110%] max-w-xl"
        >
          흩어진 정보들을 단순히 모으는 것이 아니라, 이해할 수 있는 구조로 재구성하고, 예시와 코드로
          의미를 명확히 드러냅니다. 이곳은 아는 것에서 멈추지 않고 설명할 수 있는 지식으로
          만들어가는 과정을 기록하는 공간입니다.
        </p>
      </div>

      <div
        class="flex flex-wrap items-center justify-between gap-6 mt-12 border-b border-blue-main pb-6 gsap-fade-in opacity-0"
      >
        <!-- 동적 필터 -->
        <div class="flex flex-wrap gap-3">
          <button
            v-for="category in categories"
            :key="category"
            class="chip interactive"
            :class="{ active: activeCategory === category }"
            @click="changeCategory(category)"
            @mouseenter="setHover('FILTER')"
            @mouseleave="clearHover"
          >
            {{ category }}
          </button>
        </div>
        <!-- 메타 데이터 (필터된 결과 대비 전체 결과 비율) -->
        <div class="font-mono text-xs uppercase tracking-widest text-right">
          Showing {{ String(filteredPosts.length).padStart(2, '0') }} /
          {{ String(allPosts.length).padStart(2, '0') }} Posts
        </div>
      </div>
    </header>

    <!-- Archive 리스트 -->
    <section class="archive-container flex flex-col border-t border-blue-line min-h-[500px]">
      <!-- 글이 없을 경우 예외 처리 -->
      <div v-if="paginatedPosts.length === 0" class="py-20 text-center font-mono text-blue-deep/50">
        [ NO_DOCUMENTS_FOUND ]
      </div>

      <!-- 포스트 목록 렌더링 -->
      <RouterLink
        v-for="post in paginatedPosts"
        :key="post.slug"
        :to="`/archive/${post.category}/${post.slug}`"
        custom
        v-slot="{ navigate }"
      >
        <article
          class="archive-item group relative border-b border-blue-line py-8 md:py-12 interactive cursor-pointer"
          @mouseenter="setPreview(post)"
          @mouseleave="clearPreview"
          @click="navigate"
        >
          <div class="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start relative z-10">
            <!-- 메타 데이터 -->
            <div
              class="md:col-span-3 flex md:flex-col gap-4 md:gap-2 justify-between md:justify-start font-mono text-xs uppercase text-blue-deep/70 pt-2"
            >
              <span>{{ formatDate(post.date) }}</span>
              <span class="chip self-start text-[10px] !py-1 !px-2">{{
                post.category || 'Uncategorized'
              }}</span>
            </div>
            <!-- 내용 -->
            <div class="md:col-span-8 flex flex-col gap-3">
              <h2
                class="font-namsan text-3xl md:text-5xl lg:text-6xl font-medium group-hover:italic group-hover:translate-x-4 transition-transform duration-500 origin-left"
              >
                {{ post.title }}
              </h2>
              <p
                class="font-hangang text-sm md:text-base leading-relaxed line-clamp-2 max-w-2xl opacity-80 group-hover:opacity-100 transition-opacity"
              >
                {{ post.summary }}
              </p>
            </div>
            <!-- 화살표 아이콘 -->
            <div
              class="md:col-span-1 hidden md:flex justify-end items-start pt-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </div>
          <!-- 호버 Underline -->
          <div
            class="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-main transition-all duration-700 ease-out group-hover:w-full z-0"
          ></div>
        </article>
      </RouterLink>
    </section>

    <!-- 페이지네이션 -->
    <div
      v-if="totalPages > 0"
      class="flex justify-between items-center mt-16 font-mono text-xs uppercase tracking-widest gsap-fade-in opacity-0"
    >
      <!-- 이전 페이지 버튼 -->
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="interactive hover:italic transition-all"
        :class="
          currentPage === 1
            ? 'text-text-mute line-through decoration-blue-main/30 cursor-not-allowed'
            : 'border-b border-blue-main pb-1'
        "
        @mouseenter="currentPage !== 1 && setHover('PREV')"
        @mouseleave="clearHover"
      >
        Prev Page
      </button>

      <!-- 현재 페이지 상태 -->
      <span class="font-bold">
        {{ String(currentPage).padStart(2, '0') }} / {{ String(totalPages).padStart(2, '0') }}
      </span>

      <!-- 다음 페이지 버튼 -->
      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="interactive hover:italic transition-all"
        :class="
          currentPage === totalPages
            ? 'text-text-mute line-through decoration-blue-main/30 cursor-not-allowed'
            : 'border-b border-blue-main pb-1'
        "
        @mouseenter="currentPage !== totalPages && setHover('NEXT')"
        @mouseleave="clearHover"
      >
        Next Page
      </button>
    </div>
  </main>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.chip {
  display: inline-block;
  padding: 0.35rem 1rem;
  border: 1px solid #1d4dff;
  border-radius: 999px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  text-transform: uppercase;
  transition: all 0.3s ease;
  background: transparent;
  color: #1d4dff;
  cursor: pointer;
}

.chip:hover,
.chip.active {
  background-color: #1d4dff;
  color: #fcfcfa;
}
</style>
