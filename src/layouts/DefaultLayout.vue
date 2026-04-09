<script setup>
import HeaderSection from '@/components/common/HeaderSection.vue'
import FooterSection from '@/components/common/FooterSection.vue'
import CustomCursor from '@/components/common/CustomCursor.vue'
</script>

<template>
  <CustomCursor />
  <div class="min-h-screen flex flex-col">
    <HeaderSection />
    <main class="flex-grow w-full">
      <slot />
    </main>
    <FooterSection />
  </div>
</template>

<style scoped></style>
