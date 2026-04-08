<script setup>
const emit = defineEmits(['post-enter', 'post-leave', 'post-move'])

defineProps({
  posts: {
    type: Array,
    required: true,
  },
})

const handleEnter = (post, event) => {
  emit('post-enter', { post, event })
}
const handleLeave = () => {
  emit('post-leave')
}
const handleMove = (event) => {
  emit('post-move', event)
}
</script>

<template>
  <ul class="archive-list flex flex-col border-t border-blue-line text-blue-main">
    <li
      v-for="post in posts"
      :key="post.slug"
      class="archive-item group relative border-b border-blue-line py-6 interactive"
      @mouseenter="handleEnter(post, $event)"
      @mouseleave="handleLeave"
      @mousemove="handleMove"
    >
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3
          class="font-hangang text-3xl md:text-4xl lg:text-5xl group-hover:italic group-hover:translate-x-4 transition-transform duration-500 origin-left"
        >
          {{ post.title }}
        </h3>

        <div class="flex items-center gap-4 font-mono text-xs">
          <span class="chip group-hover:bg-blue-main group-hover:text-bg-soft">{{
            post.category
          }}</span>
          <span>{{ post.date }}</span>
        </div>

        <div
          class="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-main transition-all duration-700 ease-out group-hover:w-full"
        ></div>
      </div>
    </li>
  </ul>
  <div class="mt-8 text-center">
    <button
      class="font-mono text-xs uppercase border-b border-blue-main text-blue-main pb-1 hover:italic interactive"
    >
      View All Archives
    </button>
  </div>
</template>

<style scoped></style>
