<template>
  <div class="bg-gray-900 rounded-lg border border-gray-800 p-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-800">
      
      <!-- Servers Online -->
      <div class="flex flex-col items-center justify-center p-4">
        <div class="flex items-center space-x-2 mb-2 text-gray-400">
          <ServerIcon class="w-5 h-5" />
          <span class="text-xs font-medium tracking-wider uppercase">Servers Online</span>
        </div>
        <div class="text-4xl font-bold text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
          {{ serversOnline }}
        </div>
      </div>

      <!-- Total Listed -->
      <div class="flex flex-col items-center justify-center p-4">
        <div class="flex items-center space-x-2 mb-2 text-gray-400">
          <ListBulletIcon class="w-5 h-5" />
          <span class="text-xs font-medium tracking-wider uppercase">Total Listed</span>
        </div>
        <div class="text-4xl font-bold text-white">
          {{ totalListed }}
        </div>
      </div>

      <!-- Players Active -->
      <div class="flex flex-col items-center justify-center p-4">
        <div class="flex items-center space-x-2 mb-2 text-gray-400">
          <UsersIcon class="w-5 h-5" />
          <span class="text-xs font-medium tracking-wider uppercase">Players Active</span>
        </div>
        <div class="text-4xl font-bold text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
          {{ playersActive }}
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ServerIcon, ListBulletIcon, UsersIcon } from '@heroicons/vue/24/outline';

const { getServers } = use333Networks();

const serversOnline = ref(0);
const totalListed = ref(0);
const playersActive = ref(0);

const fetchStats = async () => {
  try {
    const response = await getServers();
    if (Array.isArray(response) && response.length >= 2) {
      const serverList = response[0];
      const metadata = response[1];
      
      serversOnline.value = serverList.length;
      totalListed.value = metadata.total || 0;
      playersActive.value = metadata.players || 0;
    }
  } catch (e) {
    console.error("Failed to load stats", e);
  }
};

onMounted(() => {
  fetchStats();
});
</script>
