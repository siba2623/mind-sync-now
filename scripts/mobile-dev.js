#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const commands = {
  'build': () => {
    console.log('🔨 Building app for mobile...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build complete!');
  },
  
  'sync': () => {
    console.log('🔄 Syncing to mobile platforms...');
    execSync('npx cap sync', { stdio: 'inherit' });
    console.log('✅ Sync complete!');
  },
  
  'android': () => {
    console.log('🤖 Opening Android Studio...');
    execSync('npx cap open android', { stdio: 'inherit' });
  },
  
  'ios': () => {
    console.log('🍎 Opening Xcode...');
    execSync('npx cap open ios', { stdio: 'inherit' });
  },
  
  'run-android': () => {
    console.log('🤖 Running on Android device...');
    execSync('npx cap run android', { stdio: 'inherit' });
  },
  
  'run-ios': () => {
    console.log('🍎 Running on iOS device...');
    execSync('npx cap run ios', { stdio: 'inherit' });
  },
  
  'full-deploy': () => {
    console.log('🚀 Full mobile deployment...');
    commands.build();
    commands.sync();
    console.log('✅ Ready for mobile testing!');
  },
  
  'help': () => {
    console.log(`
📱 MindSync Mobile Development Helper

Available commands:
  build        - Build the web app
  sync         - Sync web assets to mobile platforms
  android      - Open Android Studio
  ios          - Open Xcode (macOS only)
  run-android  - Run on Android device
  run-ios      - Run on iOS device
  full-deploy  - Build and sync for mobile
  help         - Show this help

Usage: node scripts/mobile-dev.js <command>
Example: node scripts/mobile-dev.js full-deploy
    `);
  }
};

const command = process.argv[2];

if (!command || !commands[command]) {
  commands.help();
  process.exit(1);
}

try {
  commands[command]();
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}