<script setup>
import HeaderSection from '@/components/common/HeaderSection.vue'
import FooterSection from '@/components/common/FooterSection.vue'
import CustomCursor from '@/components/common/CustomCursor.vue'
</script>

<template>
  <CustomCursor />
  <div class="min-h-dvh flex flex-col">
    <HeaderSection />
    <slot />
    <FooterSection />
  </div>
</template>
