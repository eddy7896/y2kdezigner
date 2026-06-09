# 🌌 Y2K Designer - Retro Operating System Canvas Editor 🖥️

Welcome to **Y2K Designer**, a feature-rich, interactive graphic design application styled as a retro late-90s/early-2000s desktop environment (Windows 2000/Y2K aesthetic). It runs a full-fledged canvas design tool, complete with interactive desktop windows, audio player, asset manager, and machine learning-powered background removal directly in the browser!

💾 **Built with Next.js, Tailwind CSS v4, Zustand, React-Konva, and Web AI.**

---

## 🚀 Key Features

### 1. 🖥️ Interactive Windows OS Environment
*   **Draggable & Windowed Workspace:** Move, minimize, maximize, and focus windows using a custom window state manager.
*   **Retro UI Components:** Classic Windows 2000-styled taskbar, desktop icons, cascading menus, and modal dialogs.
*   **Retro Start Menu:** Launch applications, browse documents, or navigate system options.

### 2. 🎨 Y2K Designer - Canvas Editor
*   **Vector & Raster Layering:** Powered by `react-konva` for high-performance canvas scene-graph manipulation.
*   **Drawing & Text Tools:** Custom controls for drawing rectangles, circles, custom lines, free-draw brush (pen), and styled texts.
*   **Deep Layer Customization:** Customize fill colors, stroke styles/widths, node opacity, shadow offsets/blur, and blend modes (`source-over`, `multiply`, `screen`, etc.).
*   **Advanced Layer Management:** Arrange layering order (Move Up/Down), group layers into folders, toggle layer visibility, and lock/unlock layers.
*   **Interactive Transformer:** Resize, rotate, and reposition canvas nodes interactively.
*   **Sizing Presets:** Choose from classic 4:3 resolutions, modern 16:9 widescreen, 1:1 squares, or customize size parameters.

### 3. 🪄 Magic AI Cutout (Background Removal)
*   **On-Device Machine Learning:** Remove image backgrounds entirely inside the browser using `@imgly/background-removal`—no server uploads or API keys required!
*   **Real-time Progress Tracker:** Watch model downloads and inference computations through a pixel-perfect, retro system progress bar dialog.

### 4. 💿 Y2KAmp (Music Player)
*   **Retro MP3/WAV Player:** Classic Winamp-style music player loading songs dynamically from `public/library/music`.
*   **Equalizer Visualizer:** Low-resolution blocky audio visualizer reading real-time frequency data through the Web Audio API.

### 5. 📂 Asset Manager
*   **Media Uploads:** Upload image files directly to the browser session.
*   **Y2K Asset Library:** Pre-installed retro backgrounds, design assets, and overlays.
*   **Stylized Web Typography:** Ready-to-use futuristic, pixelated, and retro fonts (e.g., *Orbitron*, *Audiowide*, *Press Start 2P*, *VT323*, *Comic Sans MS*).

### 6. 💾 Export & Compiler
*   **Export PNG & PDF:** High-resolution rendering to PNG image file or PDF document via `jspdf`.
*   **Web 1.0 Compiler:** Export designs directly into native HTML structure as a retro static website!

---

## 🛠️ Technology Stack

| Component | Library / Framework |
| :--- | :--- |
| **Framework** | Next.js (App Router) |
| **Styling** | Tailwind CSS v4 (Vanilla custom elements) |
| **Canvas Engine** | Konva / React-Konva |
| **State Management** | Zustand |
| **Background Removal**| `@imgly/background-removal` |
| **PDF Generation** | jsPDF |
| **Database ORM** | Prisma (PostgreSQL support) |
| **Authentication** | NextAuth.js |

---

## 📁 Directory Structure

```text
├── app/
│   ├── api/
│   │   ├── auth/           # NextAuth dynamic API routes
│   │   └── library/        # Scans public folder library contents (music, assets)
│   ├── globals.css         # Global Tailwind CSS configurations and variables
│   ├── layout.js           # Core layout configuration
│   └── page.js             # Entry point rendering the Desktop component
├── components/
│   ├── canvas/
│   │   ├── Canvas.jsx          # Main React-Konva workspace and toolbar
│   │   ├── KonvaImageNode.jsx  # Customized image element renderer
│   │   └── KonvaTextNode.jsx   # Customizable text element renderer
│   └── os/
│       ├── AssetsWindow.jsx    # Asset manager uploads, elements, backgrounds, and fonts
│       ├── ColorWindow.jsx     # Fill/stroke colors, opacity, shadows, and blends
│       ├── Desktop.jsx         # Top-level window system & desktop wallpaper layer
│       ├── DesktopIcon.jsx     # Classic double-clickable icons
│       ├── ImageWindow.jsx     # Background removal & Image FX toolkit
│       ├── LayersWindow.jsx    # Tree-view for visibility, lock status, and layer grouping
│       ├── MusicPlayer.jsx     # Y2KAmp Winamp music player & equalizer
│       ├── ProgressBarDialog.js# Machine learning model progress bar dialog
│       ├── RetroWindow.jsx     # Draggable & focusable custom window shell
│       ├── StartMenu.jsx       # Vintage cascading menu
│       ├── Taskbar.jsx         # Retro start bar, active windows, and digital clock
│       └── ToolsWindow.jsx     # Pen, line, rectangle, circle, and select tool panels
├── lib/
│   └── auth.js             # Authentication options definition
├── prisma/
│   └── schema.prisma       # Database configuration schema
├── public/
│   ├── library/            # Directory for local backgrounds, assets, and music tracks
│   └── windows2000/        # High-quality pixel system icons
├── store/
│   ├── useCanvasStore.js   # Undo/redo state, nodes, selected IDs, canvas size
│   └── useWindowStore.js   # Window management (visibility, coordinates, z-indices)
└── package.json
```

---

## ⚙️ Getting Started

### 📋 Prerequisites
*   Node.js (v18 or higher recommended)
*   npm / yarn / pnpm

### 🛠️ Installation & Setup
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/eddy7896/y2kdezigner.git
    cd y2kdesignner
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Setup Environment Variables:**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="postgresql://username:password@localhost:5432/y2kdb?schema=public"
    NEXTAUTH_SECRET="your_nextauth_secret_here"
    ```
4.  **Run Prisma migrations (Optional):**
    ```bash
    npx prisma db push
    ```

### 💻 Running Locally
Launch the local development server:
```bash
npm run dev
```

Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)** to see the Y2K Desktop in action!

---

## 🎵 Customizing Assets & Music
To add your own music tracks or assets, place them in the following public directories:
*   **Music Tracks:** Add `.mp3` or `.wav` files to [public/library/music](file:///f:/Devlopment%20Projects/y2kdesignner/public/library/music)
*   **Design Assets:** Add transparent `.png` icons or elements to [public/library/elements](file:///f:/Devlopment%20Projects/y2kdesignner/public/library/elements)
*   **Canvas Backgrounds:** Add wallpapers to [public/library/backgrounds](file:///f:/Devlopment%20Projects/y2kdesignner/public/library/backgrounds)

The API will automatically index them and make them available inside the **Asset Manager**!
