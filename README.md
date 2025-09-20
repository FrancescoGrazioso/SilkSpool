# Silk Spool

A cross-platform desktop application for managing BepInEx mods for Hollow Knight: Silksong.

## Features

- **Automatic Game Detection**: Automatically scans for Hollow Knight: Silksong installations via Steam
- **BepInEx Integration**: Detects and validates BepInEx installation status
- **Mod Repository Management**: Add and manage multiple mod repositories
- **Mod Browser**: Search, filter, and browse mods with detailed information
- **Cross-Platform**: Works on Windows and macOS
- **Modern UI**: Dark-themed interface built with React and Tailwind CSS

## Technology Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Rust (Tauri framework)
- **Build System**: Vite + Cargo
- **Platform**: Cross-platform desktop (Windows x64, macOS arm64/x64)

## Development Status

**Current Progress**: 50% Complete (4/8 phases)

### ✅ Completed Phases
- **Phase 1**: Project Setup and Configuration
- **Phase 2**: Rust Backend - System Detection
- **Phase 3**: React Frontend - UI Components
- **Phase 4**: Mod Repository System

### 🔄 In Progress
- **Phase 5**: Advanced Features

### ⏳ Pending
- **Phase 6**: Testing and Quality
- **Phase 7**: Build and Distribution
- **Phase 8**: Finalization and Release

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- Rust 1.70+
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd SilkSpool
```

2. Install dependencies:
```bash
cd silk-spool
npm install
```

3. Run in development mode:
```bash
npm run tauri dev
```

### Building

Build for production:
```bash
npm run tauri build
```

## Project Structure

```
SilkSpool/
├── silk-spool/                 # Main application directory
│   ├── src/                    # React frontend
│   │   ├── components/         # UI components
│   │   ├── services/           # API services
│   │   ├── types/              # TypeScript definitions
│   │   └── App.tsx             # Main React component
│   ├── src-tauri/              # Rust backend
│   │   ├── src/                # Rust source code
│   │   │   ├── steam.rs        # Steam detection
│   │   │   ├── detect.rs       # Game detection
│   │   │   ├── config.rs       # Configuration management
│   │   │   ├── repository.rs   # Repository management
│   │   │   └── lib.rs          # Main entry point
│   │   └── Cargo.toml          # Rust dependencies
│   ├── public/                 # Static assets
│   └── package.json            # Node.js dependencies
└── README.md                   # This file
```

## Key Features Implemented

### Game Detection
- Automatic Steam library detection (Windows/macOS)
- Hollow Knight: Silksong installation detection
- BepInEx presence verification
- Manual path selection fallback

### Repository System
- HTTP-based repository fetching
- JSON validation and parsing
- Local caching system
- Repository management UI
- Cross-platform cache handling

### User Interface
- Modern dark-themed design
- Responsive layout
- Search and filtering
- Mod detail views with image galleries
- Repository selector with mod counts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Tauri](https://tauri.app/) framework
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)
- Game detection inspired by community mod managers
