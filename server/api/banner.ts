import satori from 'satori';
import { html } from 'satori-html';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
// @ts-ignore
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm';
import { mapImages } from '../utils/mapsBase64';
import { fontBase64 } from '../utils/fontData';

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
        // Initialize WASM
        try {
            await initWasm(resvgWasm);
        } catch (e) {
            // Ignore if already initialized
        }

        // Fetch server details
        const serverData: any = await $fetch('/api/333networks/details', {
            query: { game, ip, port }
        });

        // 1. Load Font (Roboto Bold)
        // Satori expects a clean ArrayBuffer
        const buffer = Buffer.from(fontBase64, 'base64');
        if (!fontBase64 || buffer.length === 0) {
            throw new Error('Font data is missing or empty');
        }
        const fontData = new Uint8Array(buffer).buffer;

        // 2. Load Map Image
        let mapImageData = '';
        try {
            const mapName = serverData.mapname?.toLowerCase() || '';
            
            let imageBase64 = mapImages[mapName];
            if (!imageBase64 && mapName.includes('/')) {
                const baseName = mapName.split('/').pop();
                if (baseName) {
                    imageBase64 = mapImages[baseName];
                }
            }

            if (imageBase64) {
                mapImageData = imageBase64;
            }
        } catch (e) {
            console.error('Map image processing error:', e);
        }

        // 3. Prepare Data
        const decodeHtmlEntities = (text: string) => {
            return text
                .replace(/&/g, '&')
                .replace(/</g, '<')
                .replace(/>/g, '>')
                .replace(/"/g, '"')
                .replace(/&#039;/g, "'");
        };

        const hostname = serverData.hostname ? decodeHtmlEntities(serverData.hostname) : `${ip}:${port}`;
        const displayHostname = hostname.length > 35 ? hostname.slice(0, 32) + '...' : hostname;
        
        const statsText = [
            `Map: ${serverData.mapname || 'Unknown'}`,
            `Players: ${serverData.numplayers || 0}/${serverData.maxplayers || 0}`,
            `Mode: ${serverData.gametype || 'Unknown'}`
        ].join(' | ');

        const playerPercentage = serverData.maxplayers > 0
            ? (serverData.numplayers / serverData.maxplayers) * 100
            : 0;

        // 4. Define Layout using satori-html
        const height = 95;
        const width = 550;

        // Construct HTML string
        const markup = html(`
            <div style="height: 100%; width: 100%; display: flex; flex-direction: row; background: linear-gradient(90deg, #1f2937 0%, #111827 100%); border: 2px solid #374151; position: relative; overflow: hidden; font-family: Inter;">
                
                <!-- Map Image Background -->
                ${mapImageData ? `
                <div style="position: absolute; right: 0; top: 0; width: 180px; height: 100%; display: flex;">
                    <img src="${mapImageData}" style="position: absolute; right: 0; top: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.5;" />
                    <div style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: linear-gradient(to right, #1f2937 0%, transparent 100%);"></div>
                </div>
                ` : ''}

                <!-- Content Container -->
                <div style="display: flex; flex-direction: column; padding: 20px; width: 100%; position: relative;">
                    
                    <!-- Top Row: Status + Hostname -->
                    <div style="display: flex; align-items: center; margin-bottom: 8px;">
                        <div style="display: flex; width: 12px; height: 12px; border-radius: 50%; background-color: #10b981; margin-right: 12px;"></div>
                        <div style="display: flex; color: #ffffff; font-size: 16px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 320px;">
                            ${displayHostname}
                        </div>
                    </div>

                    <!-- Stats Row -->
                    <div style="color: #9ca3af; font-size: 13px; margin-bottom: 12px; display: flex;">
                        ${statsText}
                    </div>

                    <!-- Progress Bar -->
                    <div style="width: 240px; height: 6px; background-color: #374151; display: flex; border-radius: 2px; overflow: hidden;">
                        <div style="display: flex; width: ${playerPercentage}%; height: 100%; background-color: #10b981;"></div>
                    </div>
                </div>

                <!-- Branding -->
                <div style="display: flex; position: absolute; bottom: 10px; right: 15px; color: #6366f1; font-size: 12px; font-weight: 700;">
                    ALLIED-INTEL
                </div>
            </div>
        `);

        // 5. Generate SVG
        const svg = await satori(markup, {
            width,
            height,
            fonts: [
                {
                    name: 'Inter',
                    data: fontData,
                    weight: 700,
                    style: 'normal',
                },
            ],
        });

        // 6. Convert to PNG
        const resvg = new Resvg(svg, {
            fitTo: {
                mode: 'width',
                value: width,
            },
        });
        const pngData = resvg.render();
        const pngBuffer = pngData.asPng();

        setHeader(event, 'Content-Type', 'image/png');
        setHeader(event, 'Cache-Control', 'public, max-age=60');
        
        return pngBuffer;

    } catch (error) {
        console.error('Banner generation error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to generate banner'
        });
    }
});
