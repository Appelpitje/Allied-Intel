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
          {{ totalServersOnline }}
        </div>
        <div class="text-sm font-medium text-gray-500 mt-1">
          {{ selectedGameLabel }}: {{ selectedServersOnline }}
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
        <div class="text-sm font-medium text-gray-500 mt-1">
          {{ selectedGameLabel }}: {{ selectedTotalListed }}
        </div>
      </div>

      <!-- Players Active -->
      <div class="flex flex-col items-center justify-center p-4">
        <div class="flex items-center space-x-2 mb-2 text-gray-400">
          <UsersIcon class="w-5 h-5" />
          <span class="text-xs font-medium tracking-wider uppercase">Players Active</span>
        </div>
        <div class="text-4xl font-bold text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
          {{ totalPlayersActive }}
        </div>
        <div class="text-sm font-medium text-gray-500 mt-1">
          {{ selectedGameLabel }}: {{ selectedPlayersActive }}
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ServerIcon, ListBulletIcon, UsersIcon } from '@heroicons/vue/24/outline';

const props = defineProps<{
  game?: 'mohaa' | 'mohaas' | 'mohaab';
}>();

const { getServers } = use333Networks();

// Total stats (all games)
const totalServersOnline = ref(0);
const totalListed = ref(0);
const totalPlayersActive = ref(0);

// Selected game stats
const selectedServersOnline = ref(0);
const selectedTotalListed = ref(0);
const selectedPlayersActive = ref(0);

const selectedGameLabel = computed(() => {
  const g = props.game || 'mohaa';
  return g.toUpperCase();
});

const games = ['mohaa', 'mohaas', 'mohaab'] as const;

const fetchStats = async () => {
  try {
    let tOnline = 0;
    let tListed = 0;
    let tPlayers = 0;

    // Fetch all games in parallel
    const results = await Promise.all(games.map(g => getServers(g)));

    results.forEach((response, index) => {
      const gameKey = games[index];
      if (Array.isArray(response) && response.length >= 2) {
        const serverList = response[0];
        const metadata = response[1];
        
        const online = serverList.length;
        const listed = metadata.total || 0;
        const players = metadata.players || 0;

        // Add to totals
        tOnline += online;
        tListed += listed;
        tPlayers += players;

        // If this is the selected game, set selected stats
        if (gameKey === (props.game || 'mohaa')) {
          selectedServersOnline.value = online;
          selectedTotalListed.value = listed;
          selectedPlayersActive.value = players;
        }
      }
    });

    totalServersOnline.value = tOnline;
    totalListed.value = tListed;
    totalPlayersActive.value = tPlayers;

  } catch (e) {
    console.error("Failed to load stats", e);
  }
};

onMounted(() => {
  fetchStats();
});

watch(() => props.game, () => {
  fetchStats();
});
</script>
