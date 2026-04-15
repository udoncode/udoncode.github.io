<template>
  <div class="prose max-w-none" ref="markdownWrapper" v-html="renderedHtml"></div>
</template>

<script setup>
import { computed, ref } from 'vue'
import MarkdownIt from 'markdown-it'

// 마크다운 내용 문자열 속성
const props = defineProps({
  source: {
    type: String,
    default: '',
  },
})

const markdownWrapper = ref(null)

// 마크다운 객체 초기화 (기본 설정만 유지)
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

// source(마크다운 원문)가 변경될 때마다 자동으로 HTML로 변환
const renderedHtml = computed(() => md.render(props.source))
</script>
