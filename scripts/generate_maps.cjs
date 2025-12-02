const fs = require('fs');
const path = require('path');
const maps = require('../assets/maps.json');

const output = {};

console.log('Generating base64 map images...');

for (const [key, url] of Object.entries(maps)) {
    // url is like "/images/maps/mohdm6.webp"
    // file is in "public/images/maps/mohdm6.webp"
    // remove leading slash for joining
    const relativePath = url.startsWith('/') ? url.slice(1) : url;
    const filePath = path.join(__dirname, '../public', relativePath);
    
    if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        // Determine mime
        const ext = path.extname(filePath).toLowerCase();
        const mime = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/webp';
        output[key] = `data:${mime};base64,${buffer.toString('base64')}`;
        console.log(`Processed ${key}`);
    } else {
        console.warn('File not found:', filePath);
    }
}

const content = 'export const mapImages: Record<string, string> = ' + JSON.stringify(output, null, 2) + ';';
const utilsDir = path.join(__dirname, '../server/utils');

if (!fs.existsSync(utilsDir)) {
    fs.mkdirSync(utilsDir, { recursive: true });
}

fs.writeFileSync(path.join(utilsDir, 'mapsBase64.ts'), content);
console.log('Generated server/utils/mapsBase64.ts');
