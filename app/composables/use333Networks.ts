export const use333Networks = () => {
  const CACHE_DURATION = 7.5 * 60 * 1000; // 7.5 minutes in milliseconds

  interface CacheItem<T> {
    timestamp: number;
    data: T;
  }

  const getFromCache = <T>(key: string): T | null => {
    if (import.meta.client) {
      const cached = localStorage.getItem(key);
      if (cached) {
        try {
          const parsed: CacheItem<T> = JSON.parse(cached);
          const now = Date.now();
          if (now - parsed.timestamp < CACHE_DURATION) {
            return parsed.data;
          }
        } catch (e) {
          console.error("Error parsing cache for key", key, e);
        }
      }
    }
    return null;
  };

  const saveToCache = <T>(key: string, data: T) => {
    if (import.meta.client) {
      const item: CacheItem<T> = {
        timestamp: Date.now(),
        data,
      };
      localStorage.setItem(key, JSON.stringify(item));
    }
  };

  const getServers = async (game: 'mohaa' | 'mohaas' | 'mohaab' = 'mohaa') => {
    const cacheKey = `${game}_server_list`;
    const cachedData = getFromCache<any>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    try {
      // Using a proxy or direct call depending on CORS. 
      // Assuming direct call is possible or Nuxt handles it via server route if needed.
      // For now, we'll try direct client-side fetch. 
      // If CORS is an issue, we might need a server proxy.
      const response = await fetch(`https://master.333networks.com/json/${game}`);
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      const data = await response.json();
      saveToCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error("Failed to fetch server list:", error);
      throw error;
    }
  };

  const getServerDetails = async (ip: string, port: number, game: 'mohaa' | 'mohaas' | 'mohaab' = 'mohaa') => {
    const cacheKey = `${game}_server_${ip}:${port}`;
    const cachedData = getFromCache<any>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await fetch(`https://master.333networks.com/json/${game}/${ip}:${port}`);
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      const data = await response.json();
      saveToCache(cacheKey, data);
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
