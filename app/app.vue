<script setup lang="ts">
const selectedServer = ref<any>(null);

const handleServerSelect = (server: any) => {
  selectedServer.value = server;
  window.scrollTo(0, 0);
};

const handleBack = () => {
  selectedServer.value = null;
  window.scrollTo(0, 0);
};
</script>

<template>
  <div>
    <Navbar />
    <main>
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div v-if="!selectedServer">
          <div class="mb-4">
            <StatsBar />
          </div>
          <ServerList @select-server="handleServerSelect" />
        </div>
        <div v-else>
           <ServerDetails 
             :ip="selectedServer.ip" 
             :port="selectedServer.hostport" 
             :initial-data="selectedServer"
             @back="handleBack"
           />
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<style>
@import './assets/main.css';
</style>
