// Client-side composable for fetching server data from serverinfo.appelpitje.dev API
// This replaces the SSR-based 333networks proxy approach

export interface ServerMetadata {
  players: number;
  total: number;
}

export interface Server {
  id: number;
  hostname: string;
  gametype: string;
  numplayers: number;
  maxplayers: number;
  mapname: string;
  ip: string;
  hostport: number;
  country?: string;
  password?: number | string | boolean;
  ping?: number;
  players?: Player[];
  misc?: any;
}

export interface AllServersResponse {
  mohaa: {
    servers: Server[];
    metadata: ServerMetadata;
  };
  mohaas: {
    servers: Server[];
    metadata: ServerMetadata;
  };
  mohaab: {
    servers: Server[];
    metadata: ServerMetadata;
  };
}

export interface Player {
  name: string;
  frags: number | string;
  ping: number | string;
}

const API_BASE = 'https://serverinfo.appelpitje.dev/api';

export const useServerInfo = () => {
  /**
   * Fetches all servers for all game types in one request.
   * Uses /api/servers/mohaa/all endpoint
   */
  const getAllServers = async (): Promise<AllServersResponse> => {
    try {
      const data = await $fetch<AllServersResponse>(`${API_BASE}/servers/mohaa/all`);
      return data;
    } catch (error) {
      console.error("Failed to fetch all servers:", error);
      throw error;
    }
  };

  /**
   * Fetches servers for a specific game type with optional filters.
   * Supports query, country, gametype, sortBy, order, results, and page parameters.
   */
  const getServers = async (
    game: 'mohaa' | 'mohaas' | 'mohaab' = 'mohaa',
    options?: {
      query?: string;
      country?: string;
      gametype?: string;
      sortBy?: string;
      order?: 'a' | 'd';
      results?: number;
      page?: number;
    }
  ): Promise<{ servers: Server[]; metadata: ServerMetadata }> => {
    try {
      const params = new URLSearchParams();
      if (options?.query) params.append('query', options.query);
      if (options?.country) params.append('country', options.country);
      if (options?.gametype) params.append('gametype', options.gametype);
      if (options?.sortBy) params.append('sortBy', options.sortBy);
      if (options?.order) params.append('order', options.order);
      if (options?.results) params.append('results', options.results.toString());
      if (options?.page) params.append('page', options.page.toString());

      const queryString = params.toString();
      const url = `${API_BASE}/servers/${game}${queryString ? `?${queryString}` : ''}`;

      const data = await $fetch<{ servers: Server[]; metadata: ServerMetadata }>(url);
      return data;
    } catch (error) {
      console.error(`Failed to fetch servers for ${game}:`, error);
      throw error;
    }
  };

  /**
   * Fetches detailed information for a specific server including player list.
   */
  const getServerDetails = async (
    ip: string,
    port: number,
    game: 'mohaa' | 'mohaas' | 'mohaab' = 'mohaa'
  ): Promise<Server & { [key: string]: any }> => {
    try {
      const data = await $fetch<Server & { [key: string]: any }>(
        `${API_BASE}/servers/${game}/${ip}/${port}`
      );
      return data;
    } catch (error) {
      console.error(`Failed to fetch server details for ${ip}:${port}:`, error);
      throw error;
    }
  };

  /**
   * Extracts players from server details response.
   * Player data is stored as player_0, player_1, etc.
   */
  const extractPlayers = (serverDetails: Record<string, any>): Player[] => {
    // Check for new array format first
    if (Array.isArray(serverDetails.players)) {
      return serverDetails.players;
    }

    // Fallback to old format (player_0, player_1, etc.)
    const players: Player[] = [];
    let i = 0;
    while (serverDetails[`player_${i}`]) {
      players.push(serverDetails[`player_${i}`]);
      i++;
    }
    return players;
  };

  return {
    getAllServers,
    getServers,
    getServerDetails,
    extractPlayers,
  };
};
