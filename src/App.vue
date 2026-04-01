<script setup></script>


  <template>
    <div class="bg-white text-black">
      <header class="border-b border-neutral-200">
        <div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <RouterLink to="/" class="text-lg font-bold">my blog</RouterLink>

          <nav class="flex items-center gap-6 text-sm">
            <RouterLink to="/">Home</RouterLink>
            <RouterLink to="/archive">Archive</RouterLink>
            <RouterLink to="/about">About</RouterLink>
          </nav>
        </div>
      </header>

      <RouterView />
    </div>
  </template>


<style scoped></style>
