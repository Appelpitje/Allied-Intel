<template>
  <div class="py-10">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white">Most Played Maps</h1>
      <p class="mt-2 text-gray-400">Top maps across all servers for the last 24 hours.</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12 text-red-400">
      Failed to load statistics: {{ error }}
    </div>

    <!-- Stats Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="(stat, game) in stats" :key="game" 
           class="group relative overflow-hidden rounded-xl bg-gray-900 border border-gray-800 transition-all duration-300 hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]">
        
        <!-- Map Image Background -->
        <div class="absolute inset-0">
          <img :src="getMapImage(stat.mapname)" 
               :alt="stat.mapFullName"
               class="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-100" />
          <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent"></div>
        </div>

        <!-- Content -->
        <div class="relative p-6 h-full flex flex-col items-center justify-center text-center min-h-[200px]">
          
          <!-- Game Label -->
          <div class="absolute top-4 left-4 flex items-center gap-3">
            <img v-if="getGameIcon(game)" :src="getGameIcon(game)" :alt="formatGameName(game)" class="w-8 h-auto drop-shadow-md" />
            <span class="text-white font-bold uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-xl tracking-wider">
              {{ formatGameName(game) }}
            </span>
          </div>

          <!-- Map Name -->
          <div class="mt-32">
            <h3 class="text-xl font-bold text-white group-hover:text-green-400 transition-colors duration-200 drop-shadow-lg">
              {{ stat.mapFullName }}
            </h3>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import mapsData from '../../assets/maps.json';

const { getMostPlayedMaps } = useServerInfo();

const loading = ref(true);
const error = ref<string | null>(null);
const stats = ref<any>(null);

// Type the maps data
const mapImages: Record<string, string> = mapsData;

const formatGameName = (key: string | number) => {
  if (key === 'all') return 'Overall Top';
  return String(key).toUpperCase();
};

const getMapImage = (mapname: string) => {
  // Try direct match
  if (mapImages[mapname]) return mapImages[mapname];
  
  // Try without path prefix (e.g. dm/mohdm6 -> mohdm6)
  const simpleName = mapname.split('/').pop() || mapname;
  if (mapImages[simpleName]) return mapImages[simpleName];

  // Default fallback
  return '/images/maps/mohdm1.webp'; 
};

const getGameIcon = (key: string | number) => {
  const map: Record<string, string> = {
    'mohaa': '/images/icons/AA.png',
    'mohaas': '/images/icons/SH.png',
    'mohaab': '/images/icons/BT.png'
  };
  return map[String(key)] || null;
};

onMounted(async () => {
  try {
    loading.value = true;
    stats.value = await getMostPlayedMaps();
  } catch (e: any) {
    error.value = e.message || 'Unknown error occurred';
    console.error(e);
  } finally {
    loading.value = false;
  }
});

useHead({
  title: 'Statistics - Allied Intel',
  meta: [
    { name: 'description', content: 'View most played maps and server statistics across all Allied Assault games.' }
  ]
});
</script>
