export const use333Networks = () => {
  const getServers = async (game: 'mohaa' | 'mohaas' | 'mohaab' = 'mohaa'): Promise<any> => {
    try {
      const data = await $fetch(`/api/333networks/${game}`);
      return data;
    } catch (error) {
      console.error("Failed to fetch server list:", error);
      throw error;
    }
  };

  const getServerDetails = async (ip: string, port: number, game: 'mohaa' | 'mohaas' | 'mohaab' = 'mohaa'): Promise<any> => {
    try {
      const data = await $fetch('/api/333networks/details', {
        query: {
          game,
          ip,
          port
        }
      });
      return data;
    } catch (error) {
      console.error(`Failed to fetch server details for ${ip}:${port}:`, error);
      throw error;
    }
  };

  return {
    getServers,
    getServerDetails,
  };
};
