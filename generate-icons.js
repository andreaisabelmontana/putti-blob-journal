// Generate PWA icons as SVG
const fs = require('fs');
const path = require('path');

const iconSvg = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#FFE66D" rx="20%"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="white" opacity="0.3"/>
  <text x="${size/2}" y="${size/2 + 30}" font-family="Arial" font-size="${size/4}" text-anchor="middle">🌈</text>
</svg>
`;

const iconsDir = path.join(__dirname, 'public', 'assets', 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, 'icon-192.svg'), iconSvg(192));
fs.writeFileSync(path.join(iconsDir, 'icon-512.svg'), iconSvg(512));

console.log('Generated PWA icons');
