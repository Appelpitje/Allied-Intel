<script setup lang="ts">
// Routing is now handled by Nuxt Pages
</script>

<template>
  <div>
    <Navbar />
    <main>
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <NuxtPage />
      </div>
    </main>
    <Footer />
  </div>
</template>

<style>
@import './assets/main.css';
</style>
