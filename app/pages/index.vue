<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const selectedGame = ref<'mohaa' | 'mohaas' | 'mohaab'>((route.query.game as any) || 'mohaa');

const handleGameUpdate = (game: 'mohaa' | 'mohaas' | 'mohaab') => {
  selectedGame.value = game;
  router.replace({ query: { ...route.query, game } });
};

const handleServerSelect = (server: any) => {
  // Navigate to server details page with state
  router.push({
    path: `/${server.ip}:${server.hostport}`,
    query: { game: selectedGame.value },
    state: {
      serverData: JSON.parse(JSON.stringify(server)),
      game: selectedGame.value
    }
  });
};
</script>

<template>
  <div>
    <div class="mb-4">
      <StatsBar :game="selectedGame" />
    </div>
    <ServerList 
      :game="selectedGame" 
      @update:game="handleGameUpdate" 
      @select-server="handleServerSelect" 
    />
  </div>
</template>
