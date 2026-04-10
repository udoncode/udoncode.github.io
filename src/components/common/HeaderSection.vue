<script setup>
import LogoImage from '@/svg/LogoImage.vue'
import gsap from 'gsap'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useCursor } from './CustomCursor.vue'

const { setHover, clearHover } = useCursor()

const isMenuOpen = ref(false)
const menuOverlay = ref(null)
const mobileLinks = ref([])

const navLinks = [
  { label: 'Archive', href: '/archive' },
  { label: 'About', href: '/about' },
]
const mobileMenuItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Archive', href: '/archive' },
]

let ctx
let menuTl

onMounted(() => {
  ctx = gsap.context(() => {}, menuOverlay)
})
onUnmounted(() => {
  if (ctx) ctx.revert()
})

const setMobileLinkRef = (el) => {
  if (el) {
    // 뷰 인스턴스(RouterLink)가 아닌 실제 HTML DOM 요소($el)에 접근
    const domEl = el.$el || el
    // 중복 삽입 방지
    if (!mobileLinks.value.includes(domEl)) {
      mobileLinks.value.push(domEl)
    }
  }
}
const openMenu = async () => {
  isMenuOpen.value = true
  await nextTick()

  if (menuTl) {
    menuTl.kill()
  }

  menuTl = gsap.timeline()

  menuTl
    .set(menuOverlay.value, { autoAlpha: 1 })
    .fromTo(
      menuOverlay.value,
      { yPercent: -100 },
      { yPercent: 0, duration: 0.7, ease: 'power4.inOut' },
    )
    .fromTo(
      mobileLinks.value,
      { yPercent: 100, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
      },
      '-=0.3',
    )
}
const closeMenu = () => {
  if (!menuTl) {
    isMenuOpen.value = false
    return
  }

  const closeTl = gsap.timeline({
    onComplete: () => {
      isMenuOpen.value = false
      mobileLinks.value = []
    },
  })

  closeTl
    .to(mobileLinks.value, {
      yPercent: 100,
      opacity: 0,
      duration: 0.35,
      stagger: 0.05,
      ease: 'power2.in',
    })
    .to(
      menuOverlay.value,
      {
        yPercent: -100,
        duration: 0.5,
        ease: 'power4.inOut',
      },
      '-=0.15',
    )
}
</script>

<template>
  <!-- 네비게이션 바 -->
  <nav class="fixed top-0 w-full z-50 border-b border-blue-main bg-bg-soft/90 backdrop-blur-md">
    <div class="flex justify-between items-center p-4 lg:px-8">
      <!-- 로고 -->
      <RouterLink
        to="/"
        class="inline-block"
        @mouseenter="setHover('HOME')"
        @mouseleave="clearHover"
      >
        <LogoImage />
      </RouterLink>
      <div class="flex gap-6 font-mono text-xs uppercase items-center">
        <RouterLink
          v-for="link in navLinks"
          :key="link.label"
          :to="link.href"
          class="hidden sm:block hover:underline"
          @mouseenter="setHover('LINK')"
          @mouseleave="clearHover"
        >
          {{ link.label }}
        </RouterLink>
        <button class="chip sm:hidden hover:bg-blue-main hover:text-bg-soft" @click="openMenu">
          Menu
        </button>
      </div>
    </div>
  </nav>

  <!-- 모바일 메뉴  -->
  <div
    v-if="isMenuOpen"
    ref="menuOverlay"
    class="fixed inset-0 z-100 bg-blue-main flex flex-col items-center justify-center"
  >
    <button
      class="absolute top-4 right-4 p-4 text-bg-soft font-mono text-sm uppercase"
      @click="closeMenu"
    >
      [ Close ]
    </button>

    <nav class="flex flex-col gap-6 text-center">
      <div v-for="link in mobileMenuItems" :key="link.label" class="overflow-hidden inline-block">
        <RouterLink
          :ref="setMobileLinkRef"
          :to="link.href"
          class="block font-hangang text-5xl text-bg-soft hover:italic transition-all"
          @click="closeMenu"
        >
          {{ link.label }}
        </RouterLink>
      </div>
    </nav>

    <div class="absolute bottom-8 font-mono text-xs text-bg-soft/50 uppercase tracking-widest">
      © {{ new Date().getFullYear() }}. Udoncode All rights reserved.
    </div>
  </div>
</template>

<style scoped></style>
