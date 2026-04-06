<script setup>
import HoverPreview from '@/components/HoverPreview.vue'
import ArchiveList from '@/components/ArchiveList.vue'
import { ref } from 'vue'

defineProps({
  posts: {
    type: Array,
    required: true,
  },
})

const hoveredPost = ref(null)
const isPreviewVisible = ref(false)
const previewX = ref(0)
const previewY = ref(0)

const handlePostEnter = ({ post, event }) => {
  hoveredPost.value = post
  isPreviewVisible.value = true
  previewX.value = event.clientX + 100
  previewY.value = event.clientY + 50
}
const handlePostLeave = () => {
  isPreviewVisible.value = false
}
const handlePostMove = (event) => {
  previewX.value = event.clientX + 100
  previewY.value = event.clientY + 50
}
</script>

<template>
  <section class="mt-32 px-4 lg:px-8 relative">
    <h2 class="font-namsan font-extrabold text-title mb-12 uppercase border-b-2 border-blue-main pb-4">
      아카이브 인덱스
    </h2>
    <ArchiveList
      :posts="posts"
      @post-enter="handlePostEnter"
      @post-leave="handlePostLeave"
      @post-move="handlePostMove"
    />
    <HoverPreview :visible="isPreviewVisible" :post="hoveredPost" :x="previewX" :y="previewY" />
  </section>
</template>

<style scoped></style>
