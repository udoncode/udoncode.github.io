<script setup>
import { posts } from './data/posts.js'
import HeaderSection from './components/HeaderSection.vue'
import ArchiveSection from '@/components/ArchiveSection.vue'
import HeroSection from '@/components/HeroSection.vue'
</script>

<template>
  <HeaderSection />
  <main class="pt-24 pb-20 w-full max-w-[1200px] mx-auto">
    <HeroSection />
    <ArchiveSection :posts="posts" />
  </main>
</template>

<style scoped></style>
