<script setup>
import ArchiveIndex from '@/components/home/ArchiveIndex.vue'

defineProps({
  posts: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <section class="mt-32 px-4 lg:px-8 relative">
    <h2 class="font-namsan font-extrabold text-title mb-12 uppercase border-b-2 border-blue-main pb-4">
      아카이브 인덱스
    </h2>
    <ArchiveIndex :posts="posts" />
  </section>
</template>

<style scoped></style>
