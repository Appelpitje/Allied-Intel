<template>
  <div class="bg-[#313338] rounded-md p-4 max-w-[432px] font-sans text-[#dbdee1] border-l-4 border-[#4F46E5] shadow-md">
    <div class="space-y-3">
      <div class="space-y-2">
        <!-- Provider -->
        <div class="text-xs text-[#b5bac1]">Allied-Intel</div>
        
        <!-- Title -->
        <div class="font-bold text-[#00b0f4] hover:underline cursor-pointer truncate">
          {{ server.hostname || `${server.ip}:${server.port}` }}
        </div>

        <!-- Description -->
        <div class="text-sm space-y-1">
          <div><span class="font-bold text-[#b5bac1]">Map:</span> {{ server.mapname }}</div>
          <div><span class="font-bold text-[#b5bac1]">Players:</span> {{ server.numplayers }}/{{ server.maxplayers }}</div>
          <div><span class="font-bold text-[#b5bac1]">Game:</span> {{ server.gametype }}</div>
          <div><span class="font-bold text-[#b5bac1]">IP:</span> {{ server.ip }}:{{ server.port }}</div>
        </div>

        <!-- Player List -->
        <div v-if="players && players.length > 0" class="mt-2 pt-2 border-t border-[#3f4147]">
           <div class="text-xs font-bold text-[#b5bac1] mb-1">Online Players:</div>
           <div class="text-sm text-[#dbdee1] leading-snug">
              {{ playerNames }}
           </div>
        </div>
      </div>

      <!-- Big Image (Bottom) -->
      <div v-if="displayImage" class="w-full rounded bg-[#2b2d31] overflow-hidden mt-3">
        <img 
          :src="displayImage" 
          alt="Map Image" 
          class="w-full h-auto object-cover max-h-[240px]"
          @error="handleImageError"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  server: any;
  game?: string;
  image?: string | null;
  players?: any[];
}>();

const playerNames = computed(() => {
  if (!props.players || props.players.length === 0) return 'No players online';
  const names = props.players.map(p => p.name).filter(Boolean);
  if (names.length === 0) return 'No players online';
  
  // Discord descriptions have limits, simulate that by truncating if too long
  const list = names.join(', ');
  if (list.length > 200) {
    return list.substring(0, 200) + '...';
  }
  return list;
});

const displayImage = computed(() => {
  if (props.image) return props.image;
  if (!props.server?.mapname) return '';
  return `https://image.gametracker.com/images/maps/160x120/${props.game || 'mohaa'}/${props.server.mapname}.jpg`;
});

const handleImageError = (e: Event) => {
  (e.target as HTMLImageElement).style.display = 'none';
};
</script>
