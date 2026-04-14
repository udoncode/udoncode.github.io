<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { posts } from '@/data/posts'
import MarkdownRenderer from '@/components/common/MarkdownRenderer.vue'
import { formatDate } from '@/utils/formatDate.js'
import ScrollIndicator from '@/components/common/ScrollIndicator.vue'
import TableOfContents from '@/components/common/TableOfContents.vue'

const route = useRoute()

// Vue Router의 파라미터와 일치하는 단일 포스트 찾기
const post = computed(() => {
  return posts.find(
    (p) =>
      p.slug === route.params.slug &&
      p.category?.toLowerCase() === route.params.category?.toLowerCase(),
  )
})
</script>

<template>
  <main class="flex-grow w-full pt-32 pb-20 px-4 lg:px-8 max-w-[1200px] mx-auto relative">
    <template v-if="post">
      <ScrollIndicator />
      <header class="mb-16 flex flex-col items-center text-center max-w-[1000px] mx-auto">
        <div class="font-mono text-xs uppercase tracking-widest text-blue-main mb-6">
          <span class="chip">{{ post.category }}</span> / Docs
        </div>
        <div class="reveal-overflow overflow-hidden">
          <h1
            class="font-namsan font-extrabold text-title wrap-break-word lg:text-6xl leading-[1.1] tracking-[-0.05em] text-blue-main max-w-4xl"
          >
            {{ post.title }}
          </h1>
        </div>
        <div
          class="flex items-center gap-6 mt-10 font-sans text-xs uppercase border-y border-blue-line py-3 px-6 text-blue-deep/70"
        >
          <div>
            <span class="text-blue-main font-bold">UPDATED:</span> {{ formatDate(post.date) }}
          </div>
          <div><span class="text-blue-main font-bold">DOC ID:</span> {{ post.slug }}</div>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 relative">
        <article class="lg:col-span-9">
          <MarkdownRenderer :source="post.content" />
        </article>

        <aside class="lg:col-span-3 relative">
          <div class="lg:sticky lg:top-32">
            <TableOfContents />
          </div>
        </aside>
      </div>
    </template>

    <div v-else class="py-20 text-center font-mono text-red-500">[ ERROR: DOCUMENT_NOT_FOUND ]</div>
  </main>
</template>
