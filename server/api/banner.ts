import { createCanvas } from 'canvas';
import mapConfig from '../../assets/maps.json';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const ip = query.ip as string;
    const port = parseInt(query.port as string);
    const game = (query.game as string) || 'mohaa';

    if (!ip || !port) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing ip or port parameter'
        });
    }

    try {
        // Fetch server details directly from the API
        const serverData: any = await $fetch('/api/333networks/details', {
            query: {
                game,
                ip,
                port
            }
        });

        // Create canvas (550x95 for better visibility)
        const width = 550;
        const height = 95;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#1f2937');
        gradient.addColorStop(1, '#111827');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Try to load and draw map image on the RIGHT
        const mapImageWidth = 180;
        const mapImageHeight = 95;

        try {
            const path = await import('path');
            const fs = await import('fs');

            // Get map name and find image
            const mapName = serverData.mapname?.toLowerCase() || '';
            let mapPath = (mapConfig as Record<string, string>)[mapName];

            // Try basename if full path not found
            if (!mapPath && mapName.includes('/')) {
                const baseName = mapName.split('/').pop();
                if (baseName) {
                    mapPath = (mapConfig as Record<string, string>)[baseName];
                    if (mapPath) {
                        console.log(`Found map via basename: ${baseName} (original: ${mapName})`);
                    }
                }
            } else if (mapPath) {
                console.log(`Found map directly: ${mapName}`);
            }

            if (mapPath) {
                // Convert to absolute file path
                const absolutePath = path.join(process.cwd(), 'public', mapPath);

                console.log('Trying to load image from:', absolutePath);
                console.log('File exists?', fs.existsSync(absolutePath));

                // Check if file exists before trying to load
                if (fs.existsSync(absolutePath)) {
                    // Use sharp to convert WebP to PNG buffer (canvas can't load WebP directly)
                    const sharp = (await import('sharp')).default;
                    const { loadImage } = await import('canvas');

                    // Convert WebP to PNG buffer
                    const pngBuffer = await sharp(absolutePath).png().toBuffer();
                    const mapImage = await loadImage(pngBuffer);

                    console.log('Image loaded successfully, size:', mapImage.width, 'x', mapImage.height);

                    // Draw map image on the RIGHT with slight opacity overlay
                    const mapX = width - mapImageWidth;
                    ctx.save();
                    ctx.globalAlpha = 0.5; // Increased from 0.4 for better visibility
                    ctx.drawImage(mapImage, mapX, 0, mapImageWidth, mapImageHeight);
                    ctx.restore();

                    // Add gradient overlay on map area (from right to left)
                    const mapGradient = ctx.createLinearGradient(mapX, 0, width, 0);
                    mapGradient.addColorStop(0, 'rgba(31, 41, 55, 0)');
                    mapGradient.addColorStop(1, 'rgba(31, 41, 55, 0.6)'); // Slightly less dark
                    ctx.fillStyle = mapGradient;
                    ctx.fillRect(mapX, 0, mapImageWidth, mapImageHeight);
                } else {
                    console.log('File does not exist at path:', absolutePath);
                }
            } else {
                console.log('No map path found in config for:', mapName);
            }
        } catch (mapError) {
        // If map image fails to load, just continue without it
        console.error('Could not load map image:', mapError);
    }

    // Border
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);

    // Status indicator (green dot) - back to left since map is on right
    const contentStartX = 20;
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(contentStartX, 22, 6, 0, Math.PI * 2);
    ctx.fill();

    // Text styling
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';

    // Decode HTML entities in hostname
    const decodeHtmlEntities = (text: string) => {
        return text
            .replace(/&/g, '&')
            .replace(/</g, '<')
            .replace(/>/g, '>')
            .replace(/"/g, '"')
            .replace(/&#039;/g, "'");
    };

    // Server name (truncated if too long)
    const hostname = serverData.hostname ? decodeHtmlEntities(serverData.hostname) : `${ip}:${port}`;
    const maxHostnameWidth = 300; // Increased for larger banner
    let displayHostname = hostname;
    let hostnameWidth = ctx.measureText(displayHostname).width;

    while (hostnameWidth > maxHostnameWidth && displayHostname.length > 3) {
        displayHostname = displayHostname.slice(0, -4) + '...';
        hostnameWidth = ctx.measureText(displayHostname).width;
    }

    ctx.fillText(displayHostname, contentStartX + 20, 28);

    // Stats
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#9ca3af';

    const stats = [
        `Map: ${serverData.mapname || 'Unknown'}`,
        `Players: ${serverData.numplayers || 0}/${serverData.maxplayers || 0}`,
        `Mode: ${serverData.gametype || 'Unknown'}`
    ];

    let xPos = contentStartX + 20;
    stats.forEach((stat) => {
        ctx.fillText(stat, xPos, 55);
        xPos += ctx.measureText(stat).width + 20;
    });

    // Player progress bar
    const barX = contentStartX + 20;
    const barY = 70;
    const barWidth = 240; // Increased for larger banner
    const barHeight = 6;

    // Background bar
    ctx.fillStyle = '#374151';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Progress bar
    const playerPercentage = serverData.maxplayers > 0
        ? (serverData.numplayers / serverData.maxplayers) * 100
        : 0;
    ctx.fillStyle = '#10b981';
    ctx.fillRect(barX, barY, (barWidth * playerPercentage) / 100, barHeight);

    // Allied Intel branding
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#6366f1';
    ctx.textAlign = 'right';
    ctx.fillText('ALLIED-INTEL', width - 15, height - 12);

    // Convert to JPEG buffer with 100% quality
    const buffer = canvas.toBuffer('image/jpeg', { quality: 1.0 });
    console.log('Banner generated successfully, buffer size:', buffer.length);

    // Set headers
    setHeader(event, 'Content-Type', 'image/jpeg');
    setHeader(event, 'Cache-Control', 'public, max-age=60'); // Cache for 1 minute

    return buffer;
} catch (error) {
    console.error('Banner generation error:', error);

    // Return a simple error banner
    const width = 550;
    const height = 95;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Server Offline or Error', 20, 35);

    const buffer = canvas.toBuffer('image/jpeg', { quality: 1.0 });
    setHeader(event, 'Content-Type', 'image/jpeg');
    return buffer;
}
});
