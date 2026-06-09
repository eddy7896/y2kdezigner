import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const libraryPath = path.join(process.cwd(), 'public', 'library');
  
  const getFiles = (dir) => {
    try {
    const fullPath = path.join(libraryPath, dir);
      if (!fs.existsSync(fullPath)) return [];
      const files = fs.readdirSync(fullPath);
      // Return relative URLs for browser
      return files
        .filter(f => !f.startsWith('.'))
        .map(f => `/library/${dir}/${f}`);
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  return NextResponse.json({
    backgrounds: getFiles('backgrounds'),
    elements: getFiles('elements'),
    overlays: getFiles('overlays'),
    music: getFiles('music').filter(f => f.toLowerCase().endsWith('.mp3') || f.toLowerCase().endsWith('.wav'))
  });
}
