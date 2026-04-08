<script setup>
import { posts } from '@/data/posts.js'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import HeroSection from '@/components/home/HeroSection.vue'
import ArchiveSection from '@/components/home/ArchiveSection.vue'
import FeatureSection from '@/components/home/FeatureSection.vue'
</script>

<template>
  <DefaultLayout>
    <main class="pt-24 pb-20 w-full max-w-[1200px] mx-auto">
      <HeroSection />
      <FeatureSection />
      <ArchiveSection :posts="posts" />
    </main>
  </DefaultLayout>
</template>

<style scoped></style>
