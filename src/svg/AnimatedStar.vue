<script setup>
import { computed } from 'vue'

const props = defineProps({
  /**
   * 별의 애니메이션 속도 및 방향을 결정
   * 'normal', 'slow', 'fast', 'reverse' 중 선택.
   */
  animationType: {
    type: String,
    default: 'normal',
    validator: (value) => ['normal', 'slow', 'fast', 'reverse'].includes(value),
  },
  /**
   * 별을 그리는 선의 두께
   */
  strokeWidth: {
    type: [Number, String],
    default: 8,
  },
})

// 한 화면에 여러 별을 그릴 때 SVG ID 충돌을 방지하기 위한 고유 ID
const uniqueStarId = `star-${Math.random().toString(36).substring(2, 9)}`

// Props를 CSS 애니메이션 클래스 매핑
const computedAnimationClass = computed(() => {
  switch (props.animationType) {
    case 'slow':
      return 'hero-star-slow'
    case 'fast':
      return 'hero-star-fast'
    case 'reverse':
      return 'hero-star-reverse'
    case 'normal':
    default:
      return 'hero-star'
  }
})
</script>

<template>
  <svg viewBox="0 0 400 400" class="w-full h-full">
    <g :class="computedAnimationClass">
      <line
        :id="uniqueStarId"
        x1="200"
        y1="50"
        x2="200"
        y2="350"
        stroke="currentColor"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
      />
      <use :href="`#${uniqueStarId}`" transform="rotate(30 200 200)" />
      <use :href="`#${uniqueStarId}`" transform="rotate(60 200 200)" />
      <use :href="`#${uniqueStarId}`" transform="rotate(90 200 200)" />
      <use :href="`#${uniqueStarId}`" transform="rotate(120 200 200)" />
      <use :href="`#${uniqueStarId}`" transform="rotate(150 200 200)" />
    </g>
  </svg>
</template>

<style scoped>
/* 기본 키프레임 */
@keyframes hero-star-spin {
  to {
    transform: rotate(360deg);
    opacity: 0.2;
  }
}

/* 회전 속도 조절 */
.hero-star {
  animation: hero-star-spin 3s ease-in-out infinite alternate;
  transform-origin: 200px 200px;
}

.hero-star-reverse {
  animation: hero-star-spin 4.5s ease-in-out infinite alternate-reverse;
  transform-origin: 200px 200px;
}

.hero-star-slow {
  animation: hero-star-spin 8s ease-in-out infinite alternate;
  transform-origin: 200px 200px;
}

.hero-star-fast {
  animation: hero-star-spin 2s ease-in-out infinite alternate-reverse;
  transform-origin: 200px 200px;
}
</style>
