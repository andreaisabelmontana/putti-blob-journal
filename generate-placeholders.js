// Simple placeholder image generator using node-canvas
const fs = require('fs');
const path = require('path');

// Create simple SVG placeholders instead
const colors = ['#FFE66D', '#87CEEB', '#90EE90', '#FF6B6B', '#B19CD9', '#FFB347'];
const labels = ['Happy Art', 'Calm Art', 'Energetic Art', 'Intense Art', 'Loving Art', 'Excited Art'];

const svgTemplate = (color, label, num) => `
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="${color}"/>
  <circle cx="200" cy="200" r="80" fill="white" opacity="0.5"/>
  <text x="200" y="210" font-family="Arial" font-size="24" fill="white" text-anchor="middle" font-weight="bold">${label}</text>
  <text x="200" y="240" font-family="Arial" font-size="16" fill="white" text-anchor="middle">Generated Art ${num}</text>
</svg>
`;

// Create placeholder directory
const placeholderDir = path.join(__dirname, 'public', 'assets', 'mock-art');
if (!fs.existsSync(placeholderDir)) {
    fs.mkdirSync(placeholderDir, { recursive: true });
}

// Generate SVG files
colors.forEach((color, i) => {
    const svg = svgTemplate(color, labels[i], i + 1);
    fs.writeFileSync(path.join(placeholderDir, `art${i + 1}.svg`), svg);
});

console.log('Generated 6 placeholder art files');
