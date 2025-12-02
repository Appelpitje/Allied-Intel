<template>
  <div class="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-lg">
    <div class="flex items-center gap-3 mb-6">
      <div class="p-2 bg-green-500/10 rounded-lg text-green-500">
        <ArrowTopRightOnSquareIcon class="w-6 h-6" />
      </div>
      <h2 class="text-xl font-bold text-white">Server Banner</h2>
    </div>

    <div class="space-y-6">
      <div class="text-gray-400 text-sm">Preview</div>

      <!-- Banner Preview Card -->
      <div class="relative overflow-hidden rounded-xl border border-gray-700 bg-gray-900 shadow-2xl max-w-xl mx-auto sm:mx-0">
        <!-- Background Image with Overlay -->
        <div class="absolute inset-0 z-0">
          <div 
            class="absolute inset-0 bg-cover bg-center transition-all duration-500" 
            :style="{ backgroundImage: `url('${image || ''}')` }"
          ></div>
          <div class="absolute inset-0 bg-gray-900/90 backdrop-blur-[1px]"></div>
        </div>

        <!-- Content -->
        <div class="relative z-10 p-6 font-mono">
          <!-- Top Row: Status & Ping -->
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <span class="text-green-500 font-bold tracking-wider text-sm">ALLIED INTEL</span>
            </div>
            <div class="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded text-green-400 text-xs font-bold">
              {{ averagePing }}ms • GOOD
            </div>
          </div>

          <!-- Server Name -->
          <h3 class="text-white font-bold text-xl mb-6 truncate">{{ server.hostname }}</h3>

          <!-- Stats Grid -->
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div>
              <div class="text-gray-500 text-[10px] uppercase tracking-wider font-bold mb-1">MAP</div>
              <div class="text-gray-200 font-medium truncate">{{ server.mapname }}</div>
            </div>
            <div>
              <div class="text-gray-500 text-[10px] uppercase tracking-wider font-bold mb-1">MODE</div>
              <div class="text-gray-200 font-medium truncate">{{ server.gametype }}</div>
            </div>
            <div>
              <div class="text-gray-500 text-[10px] uppercase tracking-wider font-bold mb-1">PLAYERS</div>
              <div class="text-gray-200 font-medium">{{ server.numplayers }}/{{ server.maxplayers }}</div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="w-full bg-gray-800 rounded-full h-1.5 mb-4 overflow-hidden">
            <div 
              class="h-full bg-green-500 rounded-full transition-all duration-500"
              :style="{ width: `${playerPercentage}%` }"
            ></div>
          </div>

          <!-- Footer: IP & Game -->
          <div class="flex justify-between items-center text-gray-500 text-sm">
            <div class="font-mono">{{ ip }}:{{ port }}</div>
            <div>{{ gameName }}</div>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="bg-gray-800/50 rounded-xl p-1 border border-gray-700/50">
        <div class="flex gap-1 mb-4 p-1">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
            :class="activeTab === tab.id ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
          </button>
        </div>

        <div class="relative group">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
             <span class="text-gray-500 text-xs font-mono select-none">$</span>
          </div>
          <input 
            type="text" 
            readonly 
            :value="generatedCode"
            class="w-full bg-gray-900/50 text-gray-300 text-sm font-mono rounded-lg pl-8 pr-12 py-4 border border-gray-700/50 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all truncate"
          />
          <button 
            @click="copyCode"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-all"
            title="Copy to clipboard"
          >
            <ClipboardDocumentIcon v-if="!copied" class="w-4 h-4" />
            <CheckIcon v-else class="w-4 h-4 text-green-500" />
          </button>
        </div>
      </div>

      <div class="text-center text-gray-500 text-xs">
        Embed this banner on forums or your website
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  ArrowTopRightOnSquareIcon, 
  LinkIcon, 
  CodeBracketIcon, 
  CommandLineIcon,
  ClipboardDocumentIcon,
  CheckIcon
} from '@heroicons/vue/24/outline';

const props = defineProps<{
  server: any;
  game?: string;
  ip: string;
  port: number;
  image?: string | null;
  players?: any[];
}>();

const activeTab = ref('link');
const copied = ref(false);

const tabs = [
  { id: 'link', label: 'Link', icon: LinkIcon },
  { id: 'html', label: 'HTML', icon: CodeBracketIcon },
  { id: 'bbcode', label: 'BBCode', icon: CommandLineIcon },
];

const gameName = computed(() => {
  const map: Record<string, string> = {
    'mohaa': 'MoH:AA',
    'mohaas': 'MoH:SH',
    'mohaab': 'MoH:BT'
  };
  return map[props.game || 'mohaa'] || props.game || 'MoH:AA';
});

const playerPercentage = computed(() => {
  if (!props.server) return 0;
  const max = parseInt(props.server.maxplayers) || 0;
  const current = parseInt(props.server.numplayers) || 0;
  if (max === 0) return 0;
  return Math.min((current / max) * 100, 100);
});

const averagePing = computed(() => {
  if (!props.players || props.players.length === 0) return 0;
  const total = props.players.reduce((acc, p) => acc + (parseInt(p.ping) || 0), 0);
  return Math.round(total / props.players.length);
});

const generatedCode = computed(() => {
  const url = typeof window !== 'undefined' ? window.location.href : `https://allied-intel.com/server/${props.ip}:${props.port}`;
  // Fallback image if we can't generate a dynamic one. Ideally this would be a dynamic image service.
  // For now, using the map image or a placeholder.
  const imgUrl = props.image || 'https://allied-intel.com/banner-placeholder.jpg'; 
  
  switch (activeTab.value) {
    case 'link':
      return url;
    case 'html':
      return `<a href="${url}"><img src="${imgUrl}" alt="${props.server.hostname} Banner"></a>`;
    case 'bbcode':
      return `[url=${url}][img]${imgUrl}[/img][/url]`;
    default:
      return url;
  }
});

const copyCode = () => {
  navigator.clipboard.writeText(generatedCode.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
};
</script>
