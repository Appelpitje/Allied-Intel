<template>
  <div class="container mx-auto px-4 pb-8 pt-2">
    <!-- Game Selector Tabs -->
    <div class="flex justify-center mb-8">
      <div class="bg-gray-900 p-1 rounded-xl border border-gray-800 inline-flex animate-none transform-none">
        <button 
          v-for="g in games" 
          :key="g.id"
          @click="$emit('update:game', g.id)"
          class="px-6 py-2.5 rounded-lg text-sm font-medium"
          :class="[game === g.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800']"
        >
          {{ g.name }}
        </button>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <h1 class="text-3xl font-bold text-white">{{ gameName }} Server List</h1>
      
      <!-- View Toggle -->
      <div class="flex bg-gray-900 rounded-lg p-1 border border-gray-800 self-start sm:self-auto">
        <button 
          @click="viewMode = 'grid'"
          :class="[viewMode === 'grid' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300', 'p-2 rounded-md transition-all duration-200']"
          title="Grid View"
        >
          <Squares2X2Icon class="w-5 h-5" />
        </button>
        <button 
          @click="viewMode = 'list'"
          :class="[viewMode === 'list' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300', 'p-2 rounded-md transition-all duration-200']"
          title="List View"
        >
          <ListBulletIcon class="w-5 h-5" />
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      <p class="mt-4 text-gray-400">Loading servers...</p>
    </div>

    <div v-else-if="error" class="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative" role="alert">
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline"> {{ error }}</span>
    </div>

    <div v-else>
      <!-- Search and Filters -->
      <div class="mb-6 bg-gray-900 rounded-xl border border-gray-800 p-4 flex flex-col lg:flex-row items-center gap-4 shadow-lg">
        <!-- Search -->
        <div class="relative flex-grow w-full lg:w-auto group">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search by server name..." 
            class="w-full bg-gray-800 text-white border border-gray-700 rounded-lg pl-10 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500 transition-all" 
          />
        </div>

        <!-- Filter Icon (Desktop) -->
        <div class="hidden lg:block text-gray-500">
          <FunnelIcon class="w-5 h-5" />
        </div>

        <!-- Gametype Dropdown -->
        <Listbox v-model="selectedGametype" as="div" class="relative w-full lg:w-56">
          <ListboxButton class="relative w-full cursor-pointer rounded-lg bg-gray-800 py-2.5 pl-4 pr-10 text-left text-white shadow-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm hover:bg-gray-750 transition-colors">
            <span class="block truncate">{{ selectedGametype }}</span>
            <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </ListboxButton>
          <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
            <ListboxOptions class="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-gray-800 py-1 text-base shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-gray-700">
              <ListboxOption as="template" v-for="type in gametypes" :key="type" :value="type" v-slot="{ active, selected }">
                <li :class="[active ? 'bg-indigo-600 text-white' : 'text-gray-300', 'relative cursor-pointer select-none py-2.5 pl-4 pr-9 transition-colors']">
                  <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{ type }}</span>
                  <span v-if="selected" :class="[active ? 'text-white' : 'text-indigo-400', 'absolute inset-y-0 right-0 flex items-center pr-4']">
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                    </svg>
                  </span>
                </li>
              </ListboxOption>
            </ListboxOptions>
          </transition>
        </Listbox>

        <div class="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
          <!-- Hide Empty Toggle -->
          <SwitchGroup as="div" class="flex items-center">
            <Switch v-model="hideEmpty" :class="[hideEmpty ? 'bg-indigo-600' : 'bg-gray-700', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900']">
              <span aria-hidden="true" :class="[hideEmpty ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
            </Switch>
            <SwitchLabel as="span" class="ml-3 text-sm font-medium text-gray-300 cursor-pointer">Hide Empty</SwitchLabel>
          </SwitchGroup>

          <!-- Hide Passworded Toggle -->
          <SwitchGroup as="div" class="flex items-center">
            <Switch v-model="hidePassworded" :class="[hidePassworded ? 'bg-indigo-600' : 'bg-gray-700', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900']">
              <span aria-hidden="true" :class="[hidePassworded ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
            </Switch>
            <SwitchLabel as="span" class="ml-3 text-sm font-medium text-gray-300 cursor-pointer">Hide Private</SwitchLabel>
          </SwitchGroup>
        </div>
      </div>

      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div v-for="server in filteredServers" :key="server.id" @click="selectServer(server)" class="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg hover:border-gray-500 transition-all duration-200 group cursor-pointer relative flex flex-col">
           <!-- Card Header / Background -->
           <div class="h-32 bg-gradient-to-br from-gray-800 to-gray-900 relative p-4 flex flex-col justify-between shrink-0">
              <!-- Background Pattern/Image placeholder -->
              <div 
                class="absolute inset-0 transition-all duration-500"
                :class="[
                  hasCustomMapImage(server.mapname) 
                    ? 'bg-cover bg-center opacity-80' 
                    : 'bg-[url(\'https://www.transparenttextures.com/patterns/carbon-fibre.png\')] opacity-30'
                ]"
                :style="hasCustomMapImage(server.mapname) ? { backgroundImage: `url('${getMapImage(server.mapname)}')` } : {}"
              ></div>
              <div class="absolute inset-0 bg-gradient-to-t from-gray-800 to-transparent"></div>

              <div class="relative z-10 flex justify-between items-start">
                 <!-- Flag & Lock Container -->
                 <div class="flex items-center gap-2">
                   <!-- Flag -->
                   <div v-if="server.country" class="rounded overflow-hidden shadow-sm w-6 h-4 flex-shrink-0 bg-gray-700">
                      <img 
                        :src="`https://www.growthbunker.dev/images/vueflags/flags/${server.country.toLowerCase()}.svg`" 
                        :alt="server.country"
                        class="w-full h-full object-cover"
                        @error="handleImageError"
                      />
                   </div>
                   <!-- Lock Icon -->
                   <div v-if="isPrivate(server)" class="bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/20 p-1 rounded text-yellow-500 shadow-sm">
                      <LockClosedIcon class="w-3 h-3" />
                   </div>
                 </div>

                 <!-- Ping -->
                 <div class="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/5 shadow-sm">
                    <SignalIcon class="w-3.5 h-3.5" :class="getPingColorClass(server.ping)" />
                    <span class="text-xs font-mono font-medium text-gray-300">{{ server.ping || '-' }}ms</span>
                    <div class="w-1.5 h-1.5 rounded-full" :class="getPingColorDotClass(server.ping)"></div>
                 </div>
              </div>

              <div class="relative z-10 mt-auto pt-4">
                 <h3 class="text-lg font-bold text-white truncate drop-shadow-sm">{{ server.hostname }}</h3>
                 <div class="flex items-center gap-2 mt-1.5">
                    <span class="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {{ server.gametype }}
                    </span>
                    <span class="flex items-center gap-1 text-gray-400 text-xs bg-black/20 px-2 py-0.5 rounded border border-white/5">
                       <MapIcon class="w-3 h-3" />
                       {{ server.mapname }}
                    </span>
                 </div>
              </div>
           </div>

           <!-- Card Body -->
           <div class="p-4 flex flex-col flex-grow">
              <!-- Players -->
              <div class="mb-5">
                 <div class="flex justify-between text-sm mb-2">
                    <span class="text-gray-400 flex items-center gap-1.5 font-medium">
                       <UserGroupIcon class="w-4 h-4" /> Players
                    </span>
                    <span class="font-mono font-medium" :class="getPlayerCountColor(server.numplayers, server.maxplayers)">
                      {{ server.numplayers }}<span class="text-gray-600">/</span>{{ server.maxplayers }}
                    </span>
                 </div>
                 <!-- Progress Bar -->
                 <div class="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                    <div 
                      class="h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(34,197,94,0.2)]" 
                      :class="getPlayerBarColor(server.numplayers, server.maxplayers)"
                      :style="{ width: getPlayerPercentage(server) + '%' }"
                    ></div>
                 </div>
              </div>

              <!-- Footer: IP & Copy -->
              <div class="mt-auto pt-4 border-t border-gray-700/50 flex items-center gap-3">
                 <div class="flex-grow bg-gray-900/50 rounded-lg px-3 py-2.5 text-gray-400 font-mono text-xs border border-gray-700 truncate select-all">
                    {{ server.ip }}:{{ server.hostport }}
                 </div>
                 <button 
                   @click.stop="copyAddress(server)" 
                   class="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-gray-600 hover:border-gray-500 transition-all duration-200 text-sm font-medium active:scale-95 shrink-0 group-copy"
                 >
                    <template v-if="copiedServerId === server.id">
                      <CheckIcon class="w-4 h-4 text-green-400" />
                      <span class="text-green-400">Copied!</span>
                    </template>
                    <template v-else>
                      <ClipboardDocumentIcon class="w-4 h-4 group-copy-hover:text-indigo-300" />
                      <span>Copy</span>
                    </template>
                 </button>
              </div>
           </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="overflow-x-auto bg-gray-800 shadow-xl rounded-xl border border-gray-700">
        <table class="min-w-full leading-normal">
          <thead>
            <tr class="bg-gray-900 border-b border-gray-700">
              <th class="px-4 py-3 md:px-6 md:py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Server Name</th>
              <th class="px-4 py-3 md:px-6 md:py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Map</th>
              <th class="px-4 py-3 md:px-6 md:py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Type</th>
              <th class="px-4 py-3 md:px-6 md:py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Players</th>
              <th class="px-4 py-3 md:px-6 md:py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Ping</th>
              <th class="px-4 py-3 md:px-6 md:py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">IP Address</th>
              <th class="px-4 py-3 md:px-6 md:py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-700">
            <tr v-for="server in filteredServers" :key="server.id" @click="selectServer(server)" class="hover:bg-gray-750 cursor-pointer transition-colors duration-150 ease-in-out bg-gray-800">
              <td class="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap">
                <div class="flex items-center">
                   <div v-if="isPrivate(server)" class="mr-3 text-yellow-500" title="Private Server">
                      <LockClosedIcon class="w-4 h-4" />
                   </div>
                   <!-- Flag in List View -->
                   <div class="flex-shrink-0 h-6 w-8 flex items-center justify-center mr-3" v-if="server.country">
                      <img 
                        :src="`https://www.growthbunker.dev/images/vueflags/flags/${server.country.toLowerCase()}.svg`" 
                        :alt="server.country"
                        class="w-full h-full object-contain rounded-sm shadow-sm"
                        @error="handleImageError"
                      />
                   </div>
                   <div class="flex-shrink-0 h-8 w-8 rounded bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 mr-3" v-else>
                      UNK
                   </div>
                   <div>
                      <div class="text-sm font-medium text-white">{{ server.hostname }}</div>
                   </div>
                </div>
              </td>
              <td class="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap hidden sm:table-cell">
                 <div class="flex items-center text-sm text-gray-300">
                    <MapIcon class="w-4 h-4 mr-1.5 text-gray-500" />
                    {{ server.mapname }}
                 </div>
              </td>
              <td class="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap hidden md:table-cell">
                <span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-900/50 text-indigo-200 border border-indigo-700/50">
                  {{ server.gametype }}
                </span>
              </td>
              <td class="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap">
                <div class="text-sm text-gray-300 font-mono">
                   <span :class="getPlayerCountColor(server.numplayers, server.maxplayers)">{{ server.numplayers }}</span>
                   <span class="text-gray-600">/</span>
                   <span>{{ server.maxplayers }}</span>
                </div>
              </td>
              <td class="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap hidden sm:table-cell">
                 <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full" :class="getPingColorDotClass(server.ping)"></div>
                    <span class="text-sm text-gray-300 font-mono">{{ server.ping || '-' }}ms</span>
                 </div>
              </td>
              <td class="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap hidden lg:table-cell">
                 <span class="text-sm text-gray-400 font-mono">{{ server.ip }}:{{ server.hostport }}</span>
              </td>
              <td class="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-right text-sm font-medium">
                 <button 
                   @click.stop="copyAddress(server)" 
                   class="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-600 rounded-md text-xs font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors"
                 >
                    <template v-if="copiedServerId === server.id">
                      <CheckIcon class="w-3.5 h-3.5 text-green-400" />
                      <span class="text-green-400">Copied!</span>
                    </template>
                    <template v-else>
                      <ClipboardDocumentIcon class="w-3.5 h-3.5" />
                      Copy
                    </template>
                 </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ChevronDownIcon, 
  Squares2X2Icon, 
  ListBulletIcon,
  LockClosedIcon, 
  SignalIcon,
  MapIcon,
  UserGroupIcon,
  ClipboardDocumentIcon,
  CheckIcon
} from '@heroicons/vue/24/outline';
import { Switch, SwitchGroup, SwitchLabel, Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue';
import mapConfig from '../../assets/maps.json';

const props = defineProps<{
  game?: 'mohaa' | 'mohaas' | 'mohaab';
}>();

const emit = defineEmits(['select-server', 'update:game']);
const { getServers, getServerDetails } = use333Networks();

// Map images logic
// We now use public images defined in maps.json

const servers = ref<any[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const totalPlayers = ref(0);
const totalServers = ref(0);

const games = [
  { id: 'mohaa', name: 'MOHAA' },
  { id: 'mohaas', name: 'Spearhead' },
  { id: 'mohaab', name: 'Breakthrough' }
];

// View State
const viewMode = ref<'grid' | 'list'>('grid');

// Filter States
const searchQuery = ref('');
const selectedGametype = ref('All Types');
const hideEmpty = ref(false);
const hidePassworded = ref(false);
const copiedServerId = ref<string | null>(null);

// Computed Properties
const gameName = computed(() => {
  return games.find(g => g.id === props.game)?.name || 'MOHAA';
});

const gametypes = computed(() => {
  const types = new Set(servers.value.map(s => s.gametype));
  return ['All Types', ...Array.from(types).filter(Boolean).sort()];
});

const decodeHtmlEntities = (text: string) => {
  if (!text) return '';
  if (typeof document === 'undefined') return text;
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

const filteredServers = computed(() => {
  return servers.value.filter(server => {
    // Search by name
    if (searchQuery.value && !server.hostname.toLowerCase().includes(searchQuery.value.toLowerCase())) {
      return false;
    }
    // Filter by gametype
    if (selectedGametype.value !== 'All Types' && server.gametype !== selectedGametype.value) {
      return false;
    }
    // Hide Empty
    if (hideEmpty.value && (server.numplayers === 0 || server.numplayers === '0')) {
      return false;
    }
    // Hide Passworded
    if (hidePassworded.value && (server.password === 1 || server.password === '1' || server.password === true)) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    const playersA = parseInt(a.numplayers) || 0;
    const playersB = parseInt(b.numplayers) || 0;
    return playersB - playersA;
  });
});

const fetchServers = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getServers(props.game || 'mohaa');
    // API returns [ [serverList], { metadata } ]
    if (Array.isArray(response) && response.length >= 2) {
      servers.value = response[0].map((server: any) => ({
        ...server,
        hostname: decodeHtmlEntities(server.hostname)
      }));
      const metadata = response[1];
      totalPlayers.value = metadata.players || 0;
      totalServers.value = metadata.total || 0;

      // Fetch ping for servers with players
      fetchPlayerPings();
    } else {
        // Fallback if format is different or error
        servers.value = [];
        console.error("Unexpected API response format", response);
        error.value = "Unexpected data format received from server.";
    }
  } catch (e) {
    error.value = "Failed to load server list.";
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const fetchPlayerPings = async () => {
  const serversWithPlayers = servers.value.filter(s => parseInt(s.numplayers) > 0);
  
  for (const server of serversWithPlayers) {
    try {
      const details = await getServerDetails(server.ip, server.hostport, props.game || 'mohaa');
      let totalPing = 0;
      let playerCount = 0;
      
      // Extract players and sum pings
      let i = 0;
      while (details[`player_${i}`]) {
        const player = details[`player_${i}`];
        const ping = parseInt(player.ping);
        if (!isNaN(ping) && ping !== 999) {
          totalPing += ping;
          playerCount++;
        }
        i++;
      }

      if (playerCount > 0) {
        server.ping = Math.round(totalPing / playerCount);
      }
    } catch (e) {
      console.error(`Failed to fetch details for ${server.hostname}`, e);
    }
  }
};

const selectServer = (server: any) => {
  emit('select-server', server);
};

// Helpers
const isPrivate = (server: any) => {
  return server.password === 1 || server.password === '1' || server.password === true;
};

const getPingColorClass = (ping: number | undefined) => {
   if (!ping) return 'text-gray-500';
   if (ping < 50) return 'text-green-500';
   if (ping < 100) return 'text-yellow-500';
   return 'text-red-500';
};

const getPingColorDotClass = (ping: number | undefined) => {
   if (!ping) return 'bg-gray-500';
   if (ping < 50) return 'bg-green-500';
   if (ping < 100) return 'bg-yellow-500';
   return 'bg-red-500';
};

const getPlayerPercentage = (server: any) => {
   const max = parseInt(server.maxplayers) || 0;
   const current = parseInt(server.numplayers) || 0;
   if (max === 0) return 0;
   return Math.min((current / max) * 100, 100);
};

const getPlayerCountColor = (current: any, max: any) => {
  const c = parseInt(current) || 0;
  const m = parseInt(max) || 0;
  if (c === m && m > 0) return 'text-red-400';
  if (c > 0) return 'text-green-400';
  return 'text-gray-500';
};

const getPlayerBarColor = (current: any, max: any) => {
  const c = parseInt(current) || 0;
  const m = parseInt(max) || 0;
  if (c === m && m > 0) return 'bg-red-500';
  return 'bg-green-500';
};

const copyAddress = (server: any) => {
  const address = `${server.ip}:${server.hostport}`;
  navigator.clipboard.writeText(address).then(() => {
    copiedServerId.value = server.id;
    setTimeout(() => {
      if (copiedServerId.value === server.id) {
        copiedServerId.value = null;
      }
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
};

const handleImageError = (e: Event) => {
   (e.target as HTMLImageElement).style.display = 'none';
};

const getMapImage = (mapName: string) => {
  if (!mapName) return null;
  let cleanMapName = mapName.toLowerCase();
  
  // Check JSON mapping with full name first
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

const hasCustomMapImage = (mapName: string) => {
  return !!getMapImage(mapName);
};

onMounted(() => {
  fetchServers();
});

watch(() => props.game, () => {
  fetchServers();
});
</script>
