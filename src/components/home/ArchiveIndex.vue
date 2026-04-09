<script setup>
import { useCursor } from '@/components/common/CustomCursor.vue'
import { formatDate } from '@/utils/formatDate.js'
import { computed } from 'vue'

const { setHover, clearHover, setPreview, clearPreview } = useCursor()

const props = defineProps({
  posts: {
    type: Array,
    required: true,
  },
})

const indexedPosts = computed(() => props.posts.slice(0, 5))
</script>

<template>
  <ul class="archive-list flex flex-col border-t border-blue-line text-blue-main">
    <RouterLink
      v-for="post in indexedPosts"
      :key="post.slug"
      :to="`/archive/${post.category}/${post.slug}`"
      custom
      v-slot="{ navigate }"
    >
      <li
        class="archive-item group relative border-b border-blue-line py-6 interactive"
        @mouseenter="setPreview(post)"
        @mouseleave="clearPreview"
        @click="navigate"
      >
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3
            class="font-namsan text-3xl md:text-4xl lg:text-5xl group-hover:italic group-hover:translate-x-4 transition-transform duration-500 origin-left"
          >
            {{ post.title }}
          </h3>

          <div class="flex items-center gap-4 font-mono text-xs">
            <span class="chip group-hover:bg-blue-main group-hover:text-bg-soft">{{
              post.category
            }}</span>
            <span>{{ formatDate(post.date) }}</span>
          </div>

          <div
            class="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-main transition-all duration-700 ease-out group-hover:w-full"
          ></div>
        </div>
      </li>
    </RouterLink>
  </ul>
  <div class="mt-8 text-center">
    <RouterLink
      to="/archive"
      @mouseenter="setHover('LINK')"
      @mouseleave="clearHover"
      class="font-mono text-xs uppercase border-b border-blue-main text-blue-main pb-1 hover:italic interactive"
    >
      View All Archives
    </RouterLink>
  </div>
</template>

<style scoped></style>
