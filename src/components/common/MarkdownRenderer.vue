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
  breaks: true,
  linkify: true,
  typographer: true,
})

// source(마크다운 원문)가 변경될 때마다 자동으로 HTML로 변환
const renderedHtml = computed(() => {
  if (!props.source) return ''

  // 윈도우(\r\n)와 맥(\n)의 줄바꿈 문자를 하나로 통일 (정규식 인식 오류 해결)
  let processedSource = props.source.replace(/\r\n/g, '\n')

  // 엔터가 3번 이상 연속될 경우, 초과한 엔터 개수만큼 <br/>을 삽입
  processedSource = processedSource.replace(/\n{3,}/g, (match) => {
    return '\n\n' + '<br/>\n\n'.repeat(match.length - 2)
  })

  return md.render(processedSource)
})
</script>
