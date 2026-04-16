<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useCursor } from './CustomCursor.vue'

// 상태 관리
const isOpen = ref(false)
const headings = ref([])
const activeId = ref('') // 활성화된 제목 id
let observer = null

const { setHover, clearHover } = useCursor()

const initTOC = () => {
  // h1 ~ h3 요소 찾기
  headings.value = []
  const elements = document.querySelectorAll('.prose h1, .prose h2, .prose h3')

  // 중복 ID 카운트 추적용
  const idMap = {}

  // 목차 목록 생성 및 배열 삽입 (id, text, level)
  elements.forEach((el, index) => {
    // id 생성
    let newId = el.innerText
      .trim()
      .replace(/\s+/g, '-') // 띄어쓰기를 -로 바꾸기
      .replace(/[^\w가-힣-]/g, '') // 영문, 숫자, 하이픈만 남기고 모두 제거
      .toLowerCase()

    // 텍스트가 특수문자로만 이루어져 있는 경우 대비
    if (!newId) newId = `section-${index}`

    // 제목이 같은 요소 처리
    if (idMap[newId]) {
      idMap[newId]++ // 카운트 증가
      newId = `${newId}-${idMap[newId]}`
    } else {
      idMap[newId] = 1
    }

    // 실제 DOM 요소의 ID를 새로 만든 고유 ID로 덮어쓰기
    el.id = newId

    // 목차 목록에 추가
    headings.value.push({
      id: newId,
      text: el.innerText,
      level: parseInt(el.tagName.replace('H', '')),
    })
  })

  // 현재 화면에 보이는 헤딩 요소 감지
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id
        }
      })
    },
    { rootMargin: '-10% 0px -80% 0px' }, // 화면 관찰 기준 영역 조정
  )

  elements.forEach((el) => observer.observe(el)) // 모든 헤딩 요소 관찰
}

// 제목 클릭 시 해당 위치로 이동
const scrollTo = (id) => {
  // 대상 요소 찾기
  const el = document.getElementById(id)

  // 요소가 있다면
  if (el) {
    const offset = 80 // 공간 확보 여백
    // el.getBoundingClientRect().top : 현재 화면 기준으로 그 요소가 위에서 얼마나 떨어져 있는지
    // window.scrollY : 현재 페이지가 얼마나 스크롤되었는지
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' }) // 부드럽게 스크롤
    isOpen.value = false
  }
}

onMounted(async () => {
  await nextTick()
  initTOC()
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})
</script>

<template>
  <div class="toc-wrapper">
    <button
      @click="isOpen = !isOpen"
      class="lg:hidden fixed bottom-8 right-4 z-50 chip bg-bg-soft/90 backdrop-blur-md shadow-[0_4px_20px_rgba(29,77,255,0.15)] interactive"
    >
      Contents
    </button>

    <nav
      class="transition-all duration-300"
      :class="[
        // 모바일 스타일: 우측 하단 팝업 고정
        'fixed bottom-20 right-4 z-40 w-64 p-5 bg-bg-soft/90 backdrop-blur-md border border-blue-line rounded-lg shadow-[0_8px_30px_rgba(29,77,255,0.1)] origin-bottom-right',
        isOpen
          ? 'scale-100 opacity-100 pointer-events-auto' // 열린 상태
          : 'scale-95 opacity-0 pointer-events-none', // 닫힌 상태
        // 데스크톱 스타일: 그리드 레이아웃에 맞춰 배경/테두리 제거하고 투명하게 안착
        'lg:static lg:block lg:w-full lg:p-0 lg:bg-transparent lg:border-none lg:shadow-none lg:scale-100 lg:opacity-100 lg:pointer-events-auto',
      ]"
    >
      <div
        class="font-mono text-[10px] uppercase text-blue-main font-bold mb-4 lg:mb-6 border-b border-blue-line pb-2 flex justify-between items-center tracking-widest"
      >
        <span>Contents</span>
        <!-- 모바일 창 닫기 -->
        <button
          @click="isOpen = false"
          class="lg:hidden interactive text-blue-deep hover:text-blue-main"
        >
          ✕
        </button>
      </div>

      <div class="max-h-[50vh] lg:max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
        <div v-if="headings.length === 0" class="text-xs font-mono text-text-mute py-4">
          [ NO_HEADINGS ]
        </div>

        <!-- 목차 제목 렌더링 -->
        <ul v-else class="flex flex-col gap-3 font-namsan text-[0.85rem]">
          <!-- 헤딩 레벨에 따른 들여쓰기 -->
          <li
            v-for="heading in headings"
            :key="heading.id"
            :style="{ marginLeft: `${(heading.level - 1) * 12}px` }"
          >
            <!-- 헤딩 id 스크롤 이동 -->
            <a
              :href="`#${heading.id}`"
              @click.prevent="scrollTo(heading.id)"
              @mouseenter="setHover('move')"
              @mouseleave="clearHover"
              class="block transition-all duration-200 interactive line-clamp-2 leading-snug"
              :class="
                activeId === heading.id
                  ? 'text-blue-main font-bold translate-x-1'
                  : 'text-blue-deep/50 hover:text-blue-main'
              "
            >
              {{ heading.text }}
            </a>
          </li>
        </ul>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(29, 77, 255, 0.2);
  border-radius: 4px;
}
</style>
