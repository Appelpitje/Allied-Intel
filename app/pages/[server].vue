<script setup lang="ts">
const route = useRoute();
const router = useRouter();

// Extract IP and Port from route param "server" (ip:port)
const serverParam = route.params.server as string;
const [ip, portStr] = serverParam ? serverParam.split(':') : ['', ''];
const port = portStr ? parseInt(portStr) : NaN;

// Get initial data from history state if available (client-side navigation)
const initialData = import.meta.client && history.state ? history.state.serverData : null;

// Get game from query param or history state, default to 'mohaa'
const game = computed(() => {
  const fromQuery = route.query.game as string;
  const fromState = import.meta.client && history.state ? history.state.game : null;
  return (fromQuery || fromState || 'mohaa') as 'mohaa' | 'mohaas' | 'mohaab';
});

const handleBack = () => {
  router.push({
    path: '/',
    query: { game: game.value } // Preserve game selection on back
  });
};

// Validate IP and Port
if (!ip || isNaN(port)) {
  // Invalid URL, redirect to home
  // We might want to show an error, but for now redirecting is safe
  router.push('/');
}
</script>

<template>
  <div>
    <ServerDetails 
      v-if="ip && !isNaN(port)"
      :ip="ip" 
      :port="port" 
      :game="game"
      :initial-data="initialData"
      @back="handleBack"
    />
  </div>
</template>
