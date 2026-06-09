# Project Context: Y2K Design Creator

## Overview
A high-performance, Canva/Figma-style web-based design creator focusing strictly on a "Cyber Y2K / Frutiger Aero" aesthetic.

## Tech Stack
- **Frontend**: Next.js (App Router), React, Tailwind CSS
- **State Management**: Zustand (Command Pattern for Undo/Redo)
- **Database/Auth**: Prisma with PostgreSQL (Vercel-ready), NextAuth
- **Heavy Processing**: JS/WASM based Background Removal (e.g., @imgly/background-removal) directly in Next.js/Browser.
- **UI Style**: Strict Y2K aesthetic (light mode, chunky borders, metallic gradients, pixel typography, tiled backgrounds) - no modern glassmorphism.

## Core Systems
1. **Scene Graph**: JSON-based node tree.
2. **Infill & Stroke Engine**: Solid hex, gradients, inner/outer strokes.
3. **Font & Typography**: Dynamic loading of Y2K web fonts.
4. **Background Remover**: WebAssembly/JS ML pipeline.
5. **Animation & Templates**: Timeline state and JSON template loader.
6. **Export Pipeline**: PNG (base64), PDF (jsPDF), HTML compiler.

## Methodology: "Ask, Don't Assume"
- Always propose the technical approach first.
- List 1-2 alternative approaches and trade-offs.
- Stop and ask for confirmation before writing implementation code.
- Explain the "why" behind the code architecture.
