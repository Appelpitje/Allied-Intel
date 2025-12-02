const fs = require('fs');
const path = require('path');
const maps = require('../assets/maps.json');

// Map Images Generation
const outputMaps = {};
console.log('Generating base64 map images...');

for (const [key, url] of Object.entries(maps)) {
    const relativePath = url.startsWith('/') ? url.slice(1) : url;
    const filePath = path.join(__dirname, '../public', relativePath);
    
    if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        const ext = path.extname(filePath).toLowerCase();
        const mime = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/webp';
        outputMaps[key] = `data:${mime};base64,${buffer.toString('base64')}`;
        console.log(`Processed map: ${key}`);
    } else {
        console.warn('Map file not found:', filePath);
    }
}

const utilsDir = path.join(__dirname, '../server/utils');
if (!fs.existsSync(utilsDir)) {
    fs.mkdirSync(utilsDir, { recursive: true });
}

fs.writeFileSync(path.join(utilsDir, 'mapsBase64.ts'), 
    'export const mapImages: Record<string, string> = ' + JSON.stringify(outputMaps, null, 2) + ';');
console.log('Generated server/utils/mapsBase64.ts');


// Font Generation
// Fetch Roboto Bold TTF from Google Fonts repo
const fontUrl = 'https://raw.githubusercontent.com/googlefonts/roboto/main/src/hinted/Roboto-Bold.ttf';

async function generateFont() {
    console.log(`Fetching font from ${fontUrl}...`);
    try {
        const response = await fetch(fontUrl);
        if (!response.ok) throw new Error(`Failed to fetch font: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        
        const content = `export const fontBase64 = "${base64}";`;
        fs.writeFileSync(path.join(utilsDir, 'fontData.ts'), content);
        console.log('Generated server/utils/fontData.ts');
    } catch (error) {
        console.error('Error fetching font:', error);
        // Fallback to minimal font if fetch fails? Or just exit
        process.exit(1);
    }
}

generateFont();
