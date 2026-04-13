<template>
  <div class="prose max-w-none" ref="markdownWrapper" v-html="renderedHtml"></div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import Prism from 'prismjs'
import 'prismjs/themes/prism-okaidia.css'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-python'

// 마크다운 내용 문자열 속성
const props = defineProps({
  source: {
    type: String,
    required: true,
  },
})

const markdownWrapper = ref(null)

// 마크다운 객체 초기화
const md = new MarkdownIt({ html: true })

// source(마크다운 원문)가 변경될 때마다 자동으로 HTML로 변환
const renderedHtml = computed(() => md.render(props.source))

// 마크다운이 HTML로 변환되어 화면에 그려질 때마다 Prism 실행
watch(renderedHtml, async () => {
  await nextTick() // DOM이 다 그려질 때까지 대기
  if (markdownWrapper.value) {
    Prism.highlightAllUnder(markdownWrapper.value) // 코드 블록에 색상 입히기
  }
}, { immediate: true })
</script>
