<template>
  <div class="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-lg">
    <div class="flex items-center gap-3 mb-6">
      <div class="p-2 bg-green-500/10 rounded-lg text-green-500">
        <ArrowTopRightOnSquareIcon class="w-6 h-6" />
      </div>
      <h2 class="text-xl font-bold text-white">Server Banner</h2>
    </div>

    <div class="space-y-6">

      <!-- Banner Preview - Show actual generated image -->
      <div class="flex justify-center">
        <a :href="serverUrl" target="_blank" class="block hover:opacity-90 transition-opacity">
          <img 
            :src="bannerImageUrl" 
            :alt="`${server.hostname} Server Banner`"
            class="rounded-lg border border-gray-700 shadow-lg"
          />
        </a>
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

const activeTab = ref('html');
const copied = ref(false);

const tabs = [
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

// Get the current URL (works in both SSR and client)
const requestUrl = useRequestURL();

const serverUrl = computed(() => {
  if (typeof window !== 'undefined') {
    return window.location.href;
  }
  return `${requestUrl.protocol}//${requestUrl.host}/${props.ip}:${props.port}?game=${props.game}`;
});

const bannerImageUrl = computed(() => {
  // Always use the current origin (localhost in dev, workers.dev in production)
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/banner?ip=${props.ip}&port=${props.port}&game=${props.game || 'mohaa'}`;
  }
  // SSR fallback - use request URL
  return `${requestUrl.protocol}//${requestUrl.host}/api/banner?ip=${props.ip}&port=${props.port}&game=${props.game || 'mohaa'}`;
});

const generatedCode = computed(() => {
  const url = serverUrl.value;
  const imgUrl = bannerImageUrl.value;
  
  switch (activeTab.value) {
    case 'html':
      return `<a href="${url}"><img src="${imgUrl}" alt="${props.server.hostname} Server Banner"></a>`;
    case 'bbcode':
      return `[url=${url}][img]${imgUrl}[/img][/url]`;
    default:
      return `<a href="${url}"><img src="${imgUrl}" alt="${props.server.hostname} Server Banner"></a>`;
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
