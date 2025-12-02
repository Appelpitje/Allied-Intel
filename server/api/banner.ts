import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
// @ts-ignore
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm';
import mapConfig from '../../assets/maps.json';

// Helper to create Satori nodes
const h = (type: string, props: any = {}, children: any[] | string = []) => ({
    type,
    props: {
        ...props,
        children,
    },
});

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
             // console.log('WASM init error (might be already initialized):', e);
        }

        // Fetch server details
        const serverData: any = await $fetch('/api/333networks/details', {
            query: { game, ip, port }
        });

        // 1. Load Font (Inter Bold)
        // Using a reliable CDN for the font file
        const fontData = await fetch('https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-700-normal.woff')
            .then(res => res.arrayBuffer());

        // 2. Load Map Image
        let mapImageData = '';
        try {
            const mapName = serverData.mapname?.toLowerCase() || '';
            let mapPath = (mapConfig as Record<string, string>)[mapName];

            if (!mapPath && mapName.includes('/')) {
                const baseName = mapName.split('/').pop();
                if (baseName) {
                    mapPath = (mapConfig as Record<string, string>)[baseName];
                }
            }

            if (mapPath) {
                // Construct full URL using request origin
                const reqUrl = getRequestURL(event);
                // Remove leading slash if present in mapPath to avoid double slashes
                const cleanMapPath = mapPath.startsWith('/') ? mapPath.slice(1) : mapPath;
                const imageUrl = `${reqUrl.origin}/${cleanMapPath}`;

                try {
                    const imageBuffer = await fetch(imageUrl).then(res => {
                        if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
                        return res.arrayBuffer();
                    });
                    
                    const base64 = Buffer.from(imageBuffer).toString('base64');
                    // Determine mime type based on extension
                    const ext = mapPath.split('.').pop()?.toLowerCase();
                    const mime = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/webp';
                    mapImageData = `data:${mime};base64,${base64}`;
                } catch (e) {
                    console.error('Failed to fetch map image:', imageUrl, e);
                }
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
        // Truncate hostname manually if needed, but flexbox handles overflow better
        // Let's just truncate strictly to avoid layout issues
        const displayHostname = hostname.length > 35 ? hostname.slice(0, 32) + '...' : hostname;
        
        const statsText = [
            `Map: ${serverData.mapname || 'Unknown'}`,
            `Players: ${serverData.numplayers || 0}/${serverData.maxplayers || 0}`,
            `Mode: ${serverData.gametype || 'Unknown'}`
        ].join(' • ');

        const playerPercentage = serverData.maxplayers > 0
            ? (serverData.numplayers / serverData.maxplayers) * 100
            : 0;

        // 4. Define Layout (Satori)
        const height = 95;
        const width = 550;

        const markup = h('div', {
            style: {
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                background: 'linear-gradient(90deg, #1f2937 0%, #111827 100%)',
                border: '2px solid #374151',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: 'Inter',
            }
        }, [
            // Map Image Background (Right side)
            mapImageData ? h('div', {
                style: {
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    width: '180px',
                    height: '100%',
                    display: 'flex',
                    backgroundImage: `url(${mapImageData})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.5,
                    maskImage: 'linear-gradient(to left, black 0%, transparent 100%)', // This might not work in Satori yet
                    // Alternative gradient overlay
                }
            }, [
                // Gradient Overlay for smooth transition
                h('div', {
                    style: {
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(to right, #1f2937 0%, transparent 100%)',
                    }
                })
            ]) : null,

            // Content Container
            h('div', {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '20px',
                    width: '100%',
                    position: 'relative',
                    zIndex: 10,
                }
            }, [
                // Top Row: Status + Hostname
                h('div', {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '8px',
                    }
                }, [
                    // Status Dot
                    h('div', {
                        style: {
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: '#10b981',
                            marginRight: '12px',
                        }
                    }),
                    // Hostname
                    h('div', {
                        style: {
                            color: '#ffffff',
                            fontSize: '16px',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '320px',
                        }
                    }, displayHostname)
                ]),

                // Stats Row
                h('div', {
                    style: {
                        color: '#9ca3af',
                        fontSize: '13px',
                        marginBottom: '12px',
                        display: 'flex',
                    }
                }, statsText),

                // Progress Bar
                h('div', {
                    style: {
                        width: '240px',
                        height: '6px',
                        backgroundColor: '#374151',
                        display: 'flex',
                        borderRadius: '2px',
                        overflow: 'hidden',
                    }
                }, [
                    h('div', {
                        style: {
                            width: `${playerPercentage}%`,
                            height: '100%',
                            backgroundColor: '#10b981',
                        }
                    })
                ]),
            ]),

            // Branding
            h('div', {
                style: {
                    position: 'absolute',
                    bottom: '10px',
                    right: '15px',
                    color: '#6366f1',
                    fontSize: '12px',
                    fontWeight: 700,
                    zIndex: 20,
                }
            }, 'ALLIED-INTEL')
        ]);

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
        
        // Error Fallback (Simplified)
        // We can return a basic SVG or use Satori again for error state
        // For now, just return text error
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to generate banner'
        });
    }
});
