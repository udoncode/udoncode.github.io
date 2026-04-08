<script setup>
import HeaderSection from '@/components/common/HeaderSection.vue'
import FooterSection from '@/components/common/FooterSection.vue'
import CustomCursor from '@/components/common/CustomCursor.vue'
</script>

<template>
  <CustomCursor />
  <HeaderSection />
  <slot />
  <FooterSection />
</template>

<style scoped></style>
