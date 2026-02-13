# MindSync Logo Generation Guide

## Logo Created
A modern, calming logo has been created at `public/logo.svg` featuring:
- **Brain icon** - Representing mental health and cognition
- **Gradient background** - Calming purple/indigo colors (#6366f1 to #8b5cf6)
- **Sync waves** - Representing synchronization and balance
- **Neural pathways** - Showing connectivity and wellness
- **"MS" text** - MindSync branding

## Generate PNG Icons

To generate PNG icons from the SVG for mobile apps, use one of these methods:

### Method 1: Online Converter (Easiest)
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `public/logo.svg`
3. Generate these sizes:
   - **512x512** - App store listing
   - **192x192** - Android icon
   - **180x180** - iOS icon (apple-touch-icon)
   - **32x32** - Favicon
   - **16x16** - Small favicon

### Method 2: Using ImageMagick (Command Line)
```bash
# Install ImageMagick first
# Then run these commands in the public folder:

convert logo.svg -resize 512x512 icon-512.png
convert logo.svg -resize 192x192 icon-192.png
convert logo.svg -resize 180x180 apple-touch-icon.png
convert logo.svg -resize 32x32 favicon-32x32.png
convert logo.svg -resize 16x16 favicon-16x16.png
```

### Method 3: Using Node.js (sharp library)
```bash
npm install sharp
```

Then create a script:
```javascript
const sharp = require('sharp');
const fs = require('fs');

const sizes = [
  { size: 512, name: 'icon-512.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 16, name: 'favicon-16x16.png' }
];

const svgBuffer = fs.readFileSync('public/logo.svg');

sizes.forEach(({ size, name }) => {
  sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(`public/${name}`)
    .then(() => console.log(`Generated ${name}`))
    .catch(err => console.error(`Error generating ${name}:`, err));
});
```

## Update Files

After generating PNG icons, update these files:

### 1. index.html
```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
```

### 2. manifest.json
```json
{
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 3. iOS (Capacitor)
Copy `apple-touch-icon.png` to:
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### 4. Android (Capacitor)
Copy icons to:
- `android/app/src/main/res/mipmap-*/ic_launcher.png`

## Logo Design Details

**Colors:**
- Primary: #6366f1 (Indigo)
- Secondary: #8b5cf6 (Purple)
- Accent: #ffffff (White)

**Symbolism:**
- Brain = Mental health focus
- Sync waves = Balance and harmony
- Neural pathways = Connectivity and growth
- Gradient = Calm, peaceful progression

**Style:**
- Modern, minimal design
- Rounded corners (115px radius for 512px icon)
- High contrast for visibility
- Works well at all sizes

## Testing

Test the logo at different sizes:
- ✅ 512x512 - App store
- ✅ 192x192 - Android home screen
- ✅ 180x180 - iOS home screen
- ✅ 32x32 - Browser tab
- ✅ 16x16 - Bookmark

The logo should remain clear and recognizable at all sizes.
