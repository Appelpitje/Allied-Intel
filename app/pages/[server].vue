<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const { getServerDetails } = use333Networks();

// Extract IP and Port from route param "server" (ip:port)
const serverParam = route.params.server as string;
const [ip, portStr] = serverParam ? serverParam.split(':') : ['', ''];
const port = portStr ? parseInt(portStr) : NaN;

// Get game from query param or history state, default to 'mohaa'
const game = computed(() => {
  const fromQuery = route.query.game as string;
  const fromState = import.meta.client && history.state ? history.state.game : null;
  return (fromQuery || fromState || 'mohaa') as 'mohaa' | 'mohaas' | 'mohaab';
});

// SSR Data Fetching
const { data: serverData, error } = await useAsyncData(
  `server-${ip}-${port}-${game.value}`,
  () => getServerDetails(ip, port, game.value)
);

// SEO / Open Graph Tags for Discord
if (serverData.value) {
  const s = serverData.value;
  const title = s.hostname || `${ip}:${port}`;
  const description = `Map: ${s.mapname} | Players: ${s.numplayers}/${s.maxplayers} | Game: ${s.gametype}`;
  
  // Determine color based on ping (approximate since ping is per-player, but we can use a default)
  const themeColor = '#4F46E5'; // Indigo-600

  // Map Image URL (Best effort)
  // Note: This needs to be an absolute URL for Discord. 
  // Since we don't know the deployment domain easily in all envs, we'll try to use a public one or relative if configured.
  // For now, using a generic placeholder or gametracker if available.
  const mapImage = `https://image.gametracker.com/images/maps/160x120/${game.value}/${s.mapname}.jpg`;

  useSeoMeta({
    title: title,
    ogTitle: title,
    description: description,
    ogDescription: description,
    ogImage: mapImage,
    twitterCard: 'summary_large_image',
    themeColor: themeColor,
  });
}

const handleBack = () => {
  router.push({
    path: '/',
    query: { game: game.value } // Preserve game selection on back
  });
};

// Validate IP and Port
if (!ip || isNaN(port)) {
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
      :initial-data="serverData"
      @back="handleBack"
    />
  </div>
</template>
