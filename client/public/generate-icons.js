const fs = require('fs');
const path = require('path');

// 基础SVG内容
const baseSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="45" fill="#ff4081" />
  <text x="50" y="65" font-family="Arial" font-size="50" font-weight="bold" text-anchor="middle" fill="white">M</text>
</svg>`;

// 生成不同尺寸的SVG图标
const generateSvgIcon = (size, filename) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="45" fill="#ff4081" />
  <text x="50" y="65" font-family="Arial" font-size="50" font-weight="bold" text-anchor="middle" fill="white">M</text>
</svg>`;
  
  fs.writeFileSync(path.join(__dirname, filename), svg);
  console.log(`Generated ${filename} (${size}x${size})`);
};

// 生成PNG格式的图标（使用SVG作为基础）
const generatePngIcon = (size, filename) => {
  // 由于我们在服务器环境中，我们将创建SVG版本
  // 在实际部署中，这些应该转换为PNG格式
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="45" fill="#ff4081" />
  <text x="50" y="65" font-family="Arial" font-size="50" font-weight="bold" text-anchor="middle" fill="white">M</text>
</svg>`;
  
  // 暂时创建SVG文件，实际应用中需要转换为PNG
  const svgFilename = filename.replace('.png', '.svg');
  fs.writeFileSync(path.join(__dirname, svgFilename), svg);
  console.log(`Generated ${svgFilename} (${size}x${size}) - should be converted to PNG`);
};

// 生成ICO文件（使用SVG作为基础）
const generateIcoIcon = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="45" fill="#ff4081" />
  <text x="50" y="65" font-family="Arial" font-size="50" font-weight="bold" text-anchor="middle" fill="white">M</text>
</svg>`;
  
  // 暂时创建SVG文件，实际应用中需要转换为ICO
  fs.writeFileSync(path.join(__dirname, 'favicon-ico.svg'), svg);
  console.log('Generated favicon-ico.svg - should be converted to favicon.ico');
};

// 生成所有需要的图标
console.log('Generating icons...');

// Favicon sizes
generatePngIcon(16, 'favicon-16x16.png');
generatePngIcon(32, 'favicon-32x32.png');

// Apple Touch Icons
generatePngIcon(57, 'apple-touch-icon-57x57.png');
generatePngIcon(60, 'apple-touch-icon-60x60.png');
generatePngIcon(72, 'apple-touch-icon-72x72.png');
generatePngIcon(76, 'apple-touch-icon-76x76.png');
generatePngIcon(114, 'apple-touch-icon-114x114.png');
generatePngIcon(120, 'apple-touch-icon-120x120.png');
generatePngIcon(144, 'apple-touch-icon-144x144.png');
generatePngIcon(152, 'apple-touch-icon-152x152.png');
generatePngIcon(180, 'apple-touch-icon.png');

// Android Chrome Icons
generatePngIcon(192, 'android-chrome-192x192.png');
generatePngIcon(512, 'android-chrome-512x512.png');

// Microsoft Tile
generatePngIcon(144, 'mstile-144x144.png');

// Social Media Images
generatePngIcon(1200, 'og-image.png'); // 1200x630 for Open Graph
generatePngIcon(1200, 'twitter-image.png'); // Twitter card image

// ICO file
generateIcoIcon();

console.log('Icon generation complete!');
console.log('Note: SVG files were generated. In production, convert these to PNG/ICO format using appropriate tools.');