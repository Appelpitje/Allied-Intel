<script setup lang="ts">
const router = useRouter();

const handleServerSelect = (server: any) => {
  // Navigate to server details page with state
  router.push({
    path: `/${server.ip}:${server.hostport}`,
    state: {
      serverData: JSON.parse(JSON.stringify(server))
    }
  });
};
</script>

<template>
  <div>
    <div class="mb-4">
      <StatsBar />
    </div>
    <ServerList @select-server="handleServerSelect" />
  </div>
</template>
