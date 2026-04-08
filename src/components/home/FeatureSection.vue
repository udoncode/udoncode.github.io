<script setup>
import AnimatedInfinity from '@/svg/AnimatedInfinity.vue'
import AnimatedPendulum from '@/svg/AnimatedPendulum.vue'
import AnimatedScribble from '@/svg/AnimatedScribble.vue'
</script>

<template>
  <section class="mt-32 px-4 lg:px-8 pt-12 border-t border-blue-main">
    <h2
      class="font-namsan font-extrabold text-title mb-12 uppercase border-b-2 border-blue-main pb-4 text-blue-main"
    >
      마음가짐
    </h2>

    <div
      class="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-blue-main border border-blue-main"
    >
      <article
        class="p-6 lg:p-10 flex flex-col justify-between min-h-[400px] md:min-h-[500px] lg:min-h-[600px] relative group overflow-hidden bg-bg-soft hover:bg-blue-main/5 transition-colors duration-500"
      >
        <div class="relative z-10 text-blue-main">
          <span class="font-mono text-sm border border-current px-3 py-1 rounded-sm">01</span>
        </div>

        <div class="flex-grow flex items-center justify-center w-full py-8 md:py-12">
          <div class="w-[75%] sm:w-[50%] md:w-[85%] lg:w-[75%]">
            <AnimatedInfinity />
          </div>
        </div>

        <div
          class="relative z-10 mt-auto text-blue-main transition-all duration-500 group-hover:-translate-y-2"
        >
          <h3
            class="font-hangang text-3xl lg:text-4xl leading-tight font-medium group-hover:italic transition-all duration-500"
          >
            배울 건<br />끝이 없고
          </h3>
        </div>
      </article>

      <article
        class="p-6 lg:p-10 flex flex-col justify-between min-h-[400px] md:min-h-[500px] lg:min-h-[600px] relative group overflow-hidden bg-bg-soft hover:bg-blue-main/5 transition-colors duration-500"
      >
        <div class="relative z-10 text-blue-main">
          <span class="font-mono text-sm border border-current px-3 py-1 rounded-sm">02</span>
        </div>

        <div class="flex-grow flex items-center justify-center w-full py-8 md:py-12">
          <div class="w-[70%] sm:w-[45%] md:w-[80%] lg:w-[70%]">
            <AnimatedPendulum />
          </div>
        </div>

        <div
          class="relative z-10 mt-auto text-blue-main transition-all duration-500 group-hover:-translate-y-2"
        >
          <h3
            class="font-hangang text-3xl lg:text-4xl leading-tight font-medium group-hover:italic transition-all duration-500"
          >
            시간은<br />멈추지 않으니
          </h3>
        </div>
      </article>

      <article
        class="p-6 lg:p-10 flex flex-col justify-between min-h-[400px] md:min-h-[500px] lg:min-h-[600px] relative group overflow-hidden bg-bg-soft hover:bg-blue-main/5 transition-colors duration-500"
      >
        <div class="relative z-10 text-blue-main">
          <span class="font-mono text-sm border border-current px-3 py-1 rounded-sm">03</span>
        </div>

        <div class="flex-grow flex items-center justify-center w-full py-8 md:py-12">
          <div class="w-[85%] sm:w-[60%] md:w-[95%] lg:w-[85%]">
            <AnimatedScribble />
          </div>
        </div>

        <div
          class="relative z-10 mt-auto text-blue-main transition-all duration-500 group-hover:-translate-y-2"
        >
          <h3
            class="font-hangang text-3xl lg:text-4xl leading-tight font-medium group-hover:italic transition-all duration-500"
          >
            부지런히<br />뭐라도 끄적이자.
          </h3>
        </div>
      </article>
    </div>
  </section>
</template>
