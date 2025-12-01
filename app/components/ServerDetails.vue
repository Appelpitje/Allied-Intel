<template>
  <div class="min-h-screen bg-gray-900 text-white font-sans">
    <!-- Header / Back Button -->
    <div class="mb-6">
      <button 
        @click="$emit('back')" 
        class="flex items-center text-gray-400 hover:text-white transition-colors gap-2 group"
      >
        <ArrowLeftIcon class="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span class="font-medium">Back to Server List</span>
      </button>
    </div>

    <div v-if="loading && !serverData" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>

    <div v-else-if="error" class="bg-red-900/50 border border-red-700 text-red-200 px-6 py-4 rounded-xl">
      <strong class="font-bold">Error!</strong> {{ error }}
    </div>

    <div v-else class="space-y-6 animate-fade-in">
      <!-- Hero Section -->
      <div class="relative rounded-2xl overflow-hidden h-64 sm:h-80 group">
        <!-- Background Image -->
        <div class="absolute inset-0 bg-gray-800">
           <!-- Placeholder for map image, could use map name to fetch if available -->
           <div 
             class="absolute inset-0 bg-cover bg-center opacity-50 transition-all duration-500" 
             :style="{ backgroundImage: `url('${getMapImage(serverData?.mapname) || `https://image.gametracker.com/images/maps/160x120/${game || 'mohaa'}/${serverData?.mapname || 'dm/mohdm1'}.jpg`}')` }"
           ></div>
           <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
        </div>
        
        <div class="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
           <div class="flex items-center gap-3 mb-2">
              <div v-if="isPrivate" class="bg-yellow-500/20 text-yellow-500 p-1.5 rounded-lg backdrop-blur-sm border border-yellow-500/30">
                 <LockClosedIcon class="w-4 h-4" />
              </div>
              <span class="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-600 text-white uppercase tracking-wider shadow-sm">
                {{ serverData?.gametype }}
              </span>
           </div>
           <h1 class="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg tracking-tight">{{ serverData?.hostname }}</h1>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Details -->
        <div class="lg:col-span-2 space-y-6">
           <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Current Map -->
              <div class="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 hover:border-gray-600 transition-colors">
                 <div class="flex items-start gap-4">
                    <div class="p-3 bg-green-500/10 rounded-lg text-green-500">
                       <MapIcon class="w-6 h-6" />
                    </div>
                    <div>
                       <div class="text-gray-400 text-sm font-medium mb-1">Current Map</div>
                       <div class="text-white font-semibold text-lg">{{ serverData?.mapname }}</div>
                    </div>
                 </div>
              </div>

              <!-- Game Mode -->
              <div class="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 hover:border-gray-600 transition-colors">
                 <div class="flex items-start gap-4">
                    <div class="p-3 bg-indigo-500/10 rounded-lg text-indigo-500">
                       <PuzzlePieceIcon class="w-6 h-6" />
                    </div>
                    <div>
                       <div class="text-gray-400 text-sm font-medium mb-1">Game Mode</div>
                       <div class="text-white font-semibold text-lg">{{ getGametypeName(serverData?.gametype) }}</div>
                       <div class="mt-2">
                          <span class="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase font-bold">
                             {{ serverData?.gametype }}
                          </span>
                       </div>
                    </div>
                 </div>
              </div>

              <!-- Server Address -->
              <div class="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 hover:border-gray-600 transition-colors">
                 <div class="flex items-start gap-4">
                    <div class="p-3 bg-gray-700/50 rounded-lg text-gray-400">
                       <GlobeAltIcon class="w-6 h-6" />
                    </div>
                    <div class="w-full overflow-hidden">
                       <div class="text-gray-400 text-sm font-medium mb-1">Server Address</div>
                       <div class="text-white font-mono text-lg truncate">{{ ip }}:{{ port }}</div>
                       <button @click="copyIp" class="mt-2 flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                          <ClipboardDocumentIcon class="w-3.5 h-3.5" />
                          Copy IP Address
                       </button>
                    </div>
                 </div>
              </div>

              <!-- Access Status -->
              <div class="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 hover:border-gray-600 transition-colors">
                 <div class="flex items-start gap-4">
                    <div class="p-3 rounded-lg" :class="isPrivate ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'">
                       <LockClosedIcon v-if="isPrivate" class="w-6 h-6" />
                       <LockOpenIcon v-else class="w-6 h-6" />
                    </div>
                    <div>
                       <div class="text-gray-400 text-sm font-medium mb-1">Access Status</div>
                       <div class="text-white font-semibold text-lg">{{ isPrivate ? 'Private Access' : 'Open Access' }}</div>
                       <div class="mt-2">
                          <span class="px-2 py-0.5 rounded text-[10px] border uppercase font-bold" :class="isPrivate ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : 'bg-green-500/20 text-green-300 border-green-500/30'">
                             {{ isPrivate ? 'Password Required' : 'No Password Required' }}
                          </span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <!-- Player List -->
           <div>
              <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                 <UserGroupIcon class="w-6 h-6 text-indigo-500" />
                 Active Players
              </h3>
              
              <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
                 <div v-if="players.length > 0" class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-700">
                       <thead class="bg-gray-900/50">
                          <tr>
                             <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Player Name</th>
                             <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Score / Frags</th>
                             <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Ping</th>
                          </tr>
                       </thead>
                       <tbody class="divide-y divide-gray-700 bg-transparent">
                          <tr v-for="(player, index) in players" :key="index" class="hover:bg-gray-700/30 transition-colors">
                             <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-white">{{ player.name }}</div>
                             </td>
                             <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-300 font-mono">{{ player.frags }}</div>
                             </td>
                             <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center gap-2">
                                   <div class="w-2 h-2 rounded-full" :class="getPingDotColor(player.ping)"></div>
                                   <div class="text-sm text-gray-300 font-mono">{{ player.ping }}ms</div>
                                </div>
                             </td>
                          </tr>
                       </tbody>
                    </table>
                 </div>
                 <div v-else class="p-12 text-center">
                    <UserGroupIcon class="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <h3 class="text-lg font-medium text-gray-300">No Players Online</h3>
                    <p class="text-gray-500 mt-1">Be the first one to join this server!</p>
                 </div>
              </div>
           </div>
        </div>

        <!-- Right Column: Status -->
        <div class="space-y-6">
           <!-- Player Count -->
           <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg">
              <div class="flex items-center gap-3 mb-4">
                 <UserGroupIcon class="w-5 h-5 text-green-500" />
                 <h3 class="font-medium text-gray-200">Player Count</h3>
              </div>
              
              <div class="flex items-baseline gap-1 mb-4 justify-center">
                 <span class="text-5xl font-bold text-green-500">{{ serverData?.numplayers || 0 }}</span>
                 <span class="text-xl text-gray-500 font-medium">/{{ serverData?.maxplayers || 0 }}</span>
              </div>

              <div class="w-full bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
                 <div 
                   class="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                   :style="{ width: `${playerPercentage}%` }"
                 ></div>
              </div>
              <div class="text-center text-xs text-gray-400">
                 {{ (parseInt(serverData?.maxplayers || 0) - parseInt(serverData?.numplayers || 0)) }} slots available
              </div>
           </div>

           <!-- Connection -->
           <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg">
              <div class="flex items-center gap-3 mb-4">
                 <SignalIcon class="w-5 h-5 text-green-500" />
                 <h3 class="font-medium text-gray-200">Connection</h3>
              </div>
              
              <div class="flex items-center justify-center gap-3 mb-2">
                 <div class="w-3 h-3 rounded-full" :class="pingColorDot"></div>
                 <div class="text-4xl font-bold" :class="pingColorText">{{ averagePing }} <span class="text-lg font-normal text-gray-500">ms</span></div>
              </div>
              <div class="text-center text-sm font-medium mb-4" :class="pingColorText">
                 {{ connectionQuality }} Connection
              </div>

              <div class="grid grid-cols-3 gap-2 text-center">
                 <div class="bg-gray-900/50 rounded p-2 border border-gray-700/50">
                    <div class="w-2 h-2 rounded-full bg-green-500 mx-auto mb-1"></div>
                    <div class="text-[10px] text-gray-500"><100ms</div>
                 </div>
                 <div class="bg-gray-900/50 rounded p-2 border border-gray-700/50">
                    <div class="w-2 h-2 rounded-full bg-yellow-500 mx-auto mb-1"></div>
                    <div class="text-[10px] text-gray-500"><200ms</div>
                 </div>
                 <div class="bg-gray-900/50 rounded p-2 border border-gray-700/50">
                    <div class="w-2 h-2 rounded-full bg-red-500 mx-auto mb-1"></div>
                    <div class="text-[10px] text-gray-500">>200ms</div>
                 </div>
              </div>
           </div>

           <!-- Quick Connect -->
           <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg">
              <h3 class="font-medium text-gray-200 mb-4">Quick Connect</h3>
              
              <button @click="copyIp" class="w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-lg font-medium shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mb-3 border border-yellow-500/20">
                 <ClipboardDocumentIcon class="w-5 h-5" />
                 Copy Server IP
              </button>
              
              <div class="text-center">
                 <div class="text-xs text-gray-500 mb-1">Open game console and type:</div>
                 <div class="bg-black/30 rounded px-2 py-1 text-xs font-mono text-gray-400 select-all">
                    connect {{ ip }}:{{ port }}
                 </div>
              </div>
           </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  ArrowLeftIcon, 
  LockClosedIcon, 
  LockOpenIcon, 
  MapIcon, 
  PuzzlePieceIcon, 
  GlobeAltIcon, 
  ClipboardDocumentIcon, 
  UserGroupIcon, 
  SignalIcon 
} from '@heroicons/vue/24/outline';
import mapConfig from '../../assets/maps.json';

const props = defineProps<{
  ip: string;
  port: number;
  game?: 'mohaa' | 'mohaas' | 'mohaab';
  initialData?: any;
}>();

defineEmits(['back']);

const { getServerDetails } = use333Networks();

// Map images logic
const mapAssets = import.meta.glob('../../assets/images/maps/*.{webp,png,jpg,jpeg}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const serverData = ref<any>(props.initialData || null);
const players = ref<any[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Computed
const isPrivate = computed(() => {
  const pwd = serverData.value?.password;
  return pwd === 1 || pwd === '1' || pwd === true;
});

const playerPercentage = computed(() => {
  if (!serverData.value) return 0;
  const max = parseInt(serverData.value.maxplayers) || 0;
  const current = parseInt(serverData.value.numplayers) || 0;
  if (max === 0) return 0;
  return Math.min((current / max) * 100, 100);
});

const averagePing = computed(() => {
  if (players.value.length === 0) return 0;
  const total = players.value.reduce((acc, p) => acc + (parseInt(p.ping) || 0), 0);
  return Math.round(total / players.value.length);
});

const pingColorText = computed(() => {
  const ping = averagePing.value;
  if (ping < 100) return 'text-green-500';
  if (ping < 200) return 'text-yellow-500';
  return 'text-red-500';
});

const pingColorDot = computed(() => {
  const ping = averagePing.value;
  if (ping < 100) return 'bg-green-500';
  if (ping < 200) return 'bg-yellow-500';
  return 'bg-red-500';
});

const connectionQuality = computed(() => {
  const ping = averagePing.value;
  if (ping < 100) return 'Excellent';
  if (ping < 200) return 'Good';
  return 'Poor';
});

// Methods
const decodeHtmlEntities = (text: string) => {
  if (!text) return '';
  if (typeof document === 'undefined') return text;
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

const getGametypeName = (type: string) => {
  const map: Record<string, string> = {
    'dm': 'Deathmatch',
    'tdm': 'Team Deathmatch',
    'obj': 'Objective',
    'ft': 'Freeze Tag',
    'c': 'Countdown'
  };
  return map[type?.toLowerCase()] || type || 'Unknown';
};

const getPingDotColor = (ping: string | number) => {
  const p = parseInt(ping as string) || 0;
  if (p < 100) return 'bg-green-500';
  if (p < 200) return 'bg-yellow-500';
  return 'bg-red-500';
};

const copyIp = () => {
  const address = `${props.ip}:${props.port}`;
  navigator.clipboard.writeText(address);
  // Could add toast here
};

const getMapImage = (mapName: string) => {
  if (!mapName) return null;
  let cleanMapName = mapName.toLowerCase();
  
  // Check JSON mapping
  const config = mapConfig as Record<string, string>;
  let configPath = config[cleanMapName];

  // If not found and has path prefix (e.g. dm/mohdm1), try basename
  if (!configPath && cleanMapName.includes('/')) {
    const parts = cleanMapName.split('/');
    const baseName = parts[parts.length - 1];
    if (baseName) {
      configPath = config[baseName];
    }
  }

  if (configPath) {
    // Try to find the asset in glob results
    // We try common variations of the path
    const variants = [
      configPath,
      `/${configPath}`,
      `~/${configPath}`,
      `@/${configPath}`,
      `../../${configPath}`
    ];
    
    for (const v of variants) {
      if (v && mapAssets[v]) return mapAssets[v];
    }
  }
  return null;
};

const fetchDetails = async () => {
  loading.value = true;
  error.value = null;
  try {
    const data = await getServerDetails(props.ip, props.port, props.game || 'mohaa');
    
    // Decode hostname if present in new data
    if (data.hostname) {
      data.hostname = decodeHtmlEntities(data.hostname);
    }

    // Update server data
    serverData.value = { ...serverData.value, ...data };
    
    // Extract players
    const playerList = [];
    let i = 0;
    while (data[`player_${i}`]) {
      const player = { ...data[`player_${i}`] };
      // Decode player name
      if (player.name) {
        player.name = decodeHtmlEntities(player.name);
      }
      playerList.push(player);
      i++;
    }
    players.value = playerList;
    
    // Update local numplayers count from detailed list length if available, 
    // or trust the server details
    if (serverData.value) {
        serverData.value.numplayers = playerList.length || serverData.value.numplayers;
    }
    
  } catch (e) {
    error.value = "Failed to load server details.";
    console.error(e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDetails();
});

watch(() => [props.ip, props.port, props.game], () => {
  fetchDetails();
});
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
</style>
