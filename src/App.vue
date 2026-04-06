<script setup>
import { posts } from './data/posts.js'
import ArchiveSection from '@/components/ArchiveSection.vue'
</script>

<template>
  <main class="pt-24 pb-20 w-full max-w-[1200px] mx-auto">
    <ArchiveSection :posts="posts" />
  </main>
</template>

<style scoped></style>
