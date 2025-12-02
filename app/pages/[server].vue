<script setup lang="ts">
import mapConfig from '../../assets/maps.json';

const route = useRoute();
const router = useRouter();
const { getServerDetails } = use333Networks();
const url = useRequestURL();

// Extract IP and Port from route param "server" (ip:port)
const serverParam = route.params.server as string;
const [ip = '', portStr = ''] = serverParam ? serverParam.split(':') : [];
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
  
  // Extract players
  const playerNames = [];
  let i = 0;
  while (s[`player_${i}`]) {
    const p = s[`player_${i}`];
    if (p.name) playerNames.push(p.name);
    i++;
  }

  // Format description with newlines for "fields" look
  let description = `Map: ${s.mapname}\nPlayers: ${s.numplayers}/${s.maxplayers}\nGame: ${s.gametype}\nIP: ${ip}:${port}`;
  
  if (playerNames.length > 0) {
    const playersStr = playerNames.join(', ');
    // Truncate if too long (Discord limits description)
    const maxLen = 150; 
    const truncatedPlayers = playersStr.length > maxLen 
      ? playersStr.substring(0, maxLen) + '...' 
      : playersStr;
    description += `\n\nOnline Players:\n${truncatedPlayers}`;
  }
  
  // Determine color based on ping (approximate since ping is per-player, but we can use a default)
  const themeColor = '#4F46E5'; // Indigo-600

  // Map Image URL
  // Default to Gametracker
  let mapImage = `https://image.gametracker.com/images/maps/160x120/${game.value}/${s.mapname}.jpg`;
  
  // Check if we have a local high-res image
  if (s.mapname) {
    const cleanMapName = s.mapname.toLowerCase();
    const config = mapConfig as Record<string, string>;
    let localPath = config[cleanMapName];
    
    // Try basename if full path not found
    if (!localPath && cleanMapName.includes('/')) {
      const parts = cleanMapName.split('/');
      const baseName = parts[parts.length - 1];
      localPath = config[baseName];
    }

    if (localPath) {
      // Construct absolute URL using current host
      mapImage = `${url.protocol}//${url.host}${localPath}`;
    }
  }

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
