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
             class="absolute inset-0 bg-cover bg-center opacity-80 transition-all duration-500" 
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
                          <template v-if="ipCopied">
                             <CheckIcon class="w-3.5 h-3.5 text-green-400" />
                             <span class="text-green-400">Copied!</span>
                          </template>
                          <template v-else>
                             <ClipboardDocumentIcon class="w-3.5 h-3.5" />
                             Copy IP Address
                          </template>
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

           <!-- Server Widget Banner -->
           <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg">
              <h3 class="font-medium text-gray-200 mb-4">Server Widget</h3>
              
              <div class="mb-4 rounded-lg overflow-hidden bg-gray-900/50 border border-gray-700/50">
                <iframe 
                  :src="`https://serverinfo.appelpitje.dev/api/banner/${ip}/${port}/widget`" 
                  frameborder="0" 
                  scrolling="no" 
                  width="100%" 
                  height="656"
                  class="w-full"
                ></iframe>
              </div>

              <button @click="copyIframe" class="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow transition-colors flex items-center justify-center gap-2 text-sm">
                 <template v-if="iframeCopied">
                    <CheckIcon class="w-4 h-4" />
                    Copied!
                 </template>
                 <template v-else>
                    <ClipboardDocumentIcon class="w-4 h-4" />
                    Copy Iframe Code
                 </template>
              </button>
           </div>

           <!-- Share / Discord Preview -->
           <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg">
              <h3 class="font-medium text-gray-200 mb-4 flex items-center gap-2">
                 <span class="text-[#5865F2]">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                       <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 13.48 13.48 0 0 0-1.726 3.561 18.036 18.036 0 0 0-5.274 0 13.445 13.445 0 0 0-1.73-3.563.076.076 0 0 0-.078-.037 19.768 19.768 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                 </span>
                 Share on Discord
              </h3>
              
              <div class="mb-4">
                <div class="text-xs text-gray-400 mb-2">Preview:</div>
                <DiscordEmbedPreview 
                  v-if="serverData" 
                  :server="{ ...serverData, ip, port }" 
                  :game="game"
                  :image="getMapImage(serverData.mapname)"
                  :players="players"
                />
              </div>

              <button @click="copyLink" class="w-full py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg font-medium shadow transition-colors flex items-center justify-center gap-2 text-sm">
                 <template v-if="linkCopied">
                    <CheckIcon class="w-4 h-4" />
                    Copied!
                 </template>
                 <template v-else>
                    <LinkIcon class="w-4 h-4" />
                    Copy Link
                 </template>
              </button>
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
  SignalIcon,
  LinkIcon,
  CheckIcon
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

const serverData = ref<any>(props.initialData || null);
const players = ref<any[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const ipCopied = ref(false);
const linkCopied = ref(false);
const iframeCopied = ref(false);

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
  navigator.clipboard.writeText(address).then(() => {
     ipCopied.value = true;
     setTimeout(() => {
        ipCopied.value = false;
     }, 2000);
  });
};

const copyLink = () => {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
     linkCopied.value = true;
     setTimeout(() => {
        linkCopied.value = false;
     }, 2000);
  });
};

const copyIframe = () => {
  const iframeCode = `<iframe src="https://serverinfo.appelpitje.dev/api/banner/${props.ip}/${props.port}/widget" frameborder="0" scrolling="no" width="540" height="656"></iframe>`;
  navigator.clipboard.writeText(iframeCode).then(() => {
     iframeCopied.value = true;
     setTimeout(() => {
        iframeCopied.value = false;
     }, 2000);
  });
};

// Map images logic
// We now use public images defined in maps.json
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

  return configPath || null;
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
