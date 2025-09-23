# Silk Spool - MVP Development Plan

## Project Overview
**Silk Spool** is a cross-platform desktop app for managing BepInEx mods for Hollow Knight: Silksong. The app automatically detects game installations, verifies BepInEx presence, and manages a mod catalog from configurable repositories.

## Technology Stack
- **Framework**: Tauri (Rust + TypeScript/React)
- **Frontend**: React + TypeScript + Tailwind CSS
- **UI**: Dark mode by default, responsive design
- **Storage**: Local JSON files in app-data
- **Build**: Windows x64, macOS (arm64 + x64)

## Progress Summary
- ✅ **Phase 1**: Project Setup and Configuration (COMPLETED)
- ✅ **Phase 2**: Rust Backend - System Detection (COMPLETED)
- ✅ **Phase 3**: React Frontend - UI Components (COMPLETED)
- ✅ **Phase 4**: Mod Repository System (COMPLETED)
- ✅ **Phase 5**: Advanced Features (COMPLETED)
- 🔄 **Phase 6**: Testing and Quality (IN PROGRESS - 2/3 sections completed)
- ⏳ **Phase 7**: Build and Distribution (PENDING)
- ⏳ **Phase 8**: Finalization and Release (PENDING)

**Overall Progress**: 85% (5/8 phases completed, Phase 6 partially completed)
**Current Version**: 0.2.0 (Beta Release)

### Recent Completions (v0.2.0)
- ✅ **Mod Installation System**: Complete download, decompression, and installation workflow
- ✅ **Mod Uninstallation System**: Complete removal workflow with confirmation dialogs
- ✅ **Installed Mods Tracking**: Persistent storage and real-time UI updates
- ✅ **Tauri Compatibility**: Fixed window.confirm() and URL opening issues
- ✅ **Official Repository Integration**: Hardcoded GitHub repository with automatic loading
- ✅ **Modular Download System**: Support for multiple hosting services (GitHub, MediaFire, Dropbox, Google Drive)
- ✅ **Real-time UI Updates**: React hooks for automatic UI updates when mod status changes
- ✅ **Enhanced Error Handling**: Improved user feedback and error recovery systems
- ✅ **Smart Repository Visibility**: Built-in repository hidden when empty
- ✅ **UI Polish**: Fixed URL truncation bug and added sources repository link
- ✅ **Modular Download System**: Universal download handler supporting multiple host types

---

## PHASE 1: Project Setup and Configuration

### 1.1 Tauri Initialization ✅ COMPLETED
- [x] Install Tauri CLI: `npm install -g @tauri-apps/cli`
- [x] Create new project: `npm create tauri-app@latest silk-spool`
- [x] Configure `tauri.conf.json` for:
  - [x] App name: "Silk Spool"
  - [x] Bundle identifier: `com.silkspool.app`
  - [x] Required filesystem permissions (configured via capabilities)
  - [x] Target platforms: Windows x64, macOS universal
  - [x] Minimum window size: 900x600
  - [x] App icons for both platforms

### 1.2 Frontend Configuration ✅ COMPLETED
- [x] Install React/TypeScript dependencies:
  ```bash
  npm install react react-dom @types/react @types/react-dom
  npm install typescript @types/node
  ```
- [x] Configure Tailwind CSS:
  ```bash
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```
- [x] Configure `tailwind.config.js` with:
  - [x] Dark mode by default
  - [x] Custom theme colors (primary blue, gray scale)
  - [x] System fonts for modern UI

### 1.3 Folder Structure ✅ COMPLETED
```
silk-spool/
├── src/
│   ├── components/          # React components (created)
│   ├── pages/               # Main pages (created)
│   ├── lib/                 # Utilities and logic (created)
│   ├── styles/              # CSS and Tailwind (created)
│   ├── types/               # TypeScript types (created with full interfaces)
│   ├── App.tsx              # Main app component (updated with modern UI)
│   ├── App.css              # Tailwind + custom styles (configured)
│   └── main.tsx             # React entry point
├── src-tauri/               # Rust backend
│   ├── src/
│   │   ├── lib.rs           # Rust entry point
│   │   └── main.rs          # Main Rust file
│   ├── tauri.conf.json      # Tauri configuration (configured)
│   └── Cargo.toml           # Rust dependencies
├── tests/                   # Test suite (created)
│   └── fs-mocks/            # Filesystem mocks for testing (created)
├── public/                  # Static assets
├── tailwind.config.js       # Tailwind configuration (created)
├── postcss.config.js        # PostCSS configuration (created)
└── dist/                    # Build output
```

**Additional Completed Items:**
- [x] TypeScript interfaces defined for all core types (Mod, Repository, GameStatus, etc.)
- [x] Modern UI layout implemented with header, sidebar, and main panel
- [x] Dark mode styling with custom color scheme
- [x] Loading states and empty states implemented
- [x] Responsive design with proper minimum window size
- [x] Custom CSS components (buttons, inputs, cards) created
- [x] PostCSS configuration fixed for Tailwind CSS compatibility
- [x] Dark mode classes added to HTML for proper theming
- [x] Node.js version upgraded to 22.19.0 for Vite compatibility
- [x] Development server running successfully with proper styling
- [x] Tailwind CSS v4 downgraded to v3.4.0 for stability
- [x] All styling issues resolved - dark theme working perfectly
- [x] Git repository initialized with proper .gitignore
- [x] README.md created with user-friendly documentation
- [x] GitHub repository created and code pushed
- [x] Project documentation and setup instructions completed

---

## PHASE 2: Rust Backend - System Detection ✅ COMPLETED

### 2.1 Steam Detection (steam.rs) ✅ COMPLETED
- [x] **Windows**: Read and parse `libraryfolders.vdf` to extract Steam library paths
- [x] **macOS**: Read and parse `libraryfolders.vdf` with fallback to default Steam path
- [x] **VDF Parser**: Implemented simple VDF parsing for library paths
- [x] **Cross-platform**: Platform-specific detection functions with unified interface

### 2.2 Game Detection (detect.rs) ✅ COMPLETED
- [x] **`find_game_roots()` function**: Iterate through Steam libraries to find Silksong
- [x] **Pattern matching**: Regex patterns for `/silksong/i`, `/hollow.?knight.?silksong/i`
- [x] **Path validation**: Verify game file presence (.exe on Windows, .app on macOS)
- [x] **Game status**: Return comprehensive game detection results

### 2.3 BepInEx Detection (detect.rs) ✅ COMPLETED
- [x] **Windows**: Check for `BepInEx/` folder and loader files (`winhttp.dll` or `doorstop_config.ini`)
- [x] **macOS**: Check for `BepInEx/` folder and `run_bepinex.sh` script
- [x] **Status detection**: Distinguish between "present", "initialized", and "not detected"
- [x] **Log verification**: Check `BepInEx/LogOutput.txt` for initialization status

### 2.4 Configuration Management (config.rs) ✅ COMPLETED
- [x] **AppConfig structure**: Complete configuration with game path, repos, and UI settings
- [x] **File operations**: Load/save configuration to JSON in app data directory
- [x] **Path validation**: Validate game paths and repository URLs
- [x] **Repository management**: Add/remove repository URLs from configuration

### 2.5 Tauri Integration ✅ COMPLETED
- [x] **Tauri commands**: Created async commands for all backend functionality
- [x] **Frontend integration**: Updated React app to use real Rust backend
- [x] **Error handling**: Proper error propagation from Rust to TypeScript
- [x] **Type safety**: Full TypeScript interfaces matching Rust structs

**Additional Completed Items:**
- [x] Rust dependencies configured (vdf, walkdir, regex, dirs)
- [x] Cross-platform compilation working (Windows/macOS)
- [x] Real-time game detection replacing mock data
- [x] Manual path selection functionality
- [x] Configuration persistence system
- [x] Test repository functionality for development
- [x] Repository parsing and validation system
- [x] Type definitions and data structures

---

## PHASE 3: React Frontend - UI Components ✅ COMPLETED

### 3.1 Core UI Components ✅ COMPLETED
- [x] **SearchBar**: Debounced search input with clear button and search icon
- [x] **StatusBar**: Game and BepInEx status indicators with path display
- [x] **RepoSelector**: Dropdown for repository selection with mod counts
- [x] **ModItem**: Individual mod card with title, authors, description, requirements
- [x] **ModList**: Virtualized list with search filtering and empty states
- [x] **ModDetail**: Comprehensive mod details with images, downloads, and lightbox
- [x] **AddRepoDialog**: Modal dialog for adding new repositories
- [x] **AdvancedFilters**: Advanced filtering with requirements, authors, and sorting
- [x] **LazyImage**: Lazy loading image component with caching
- [x] **ImageGallery**: Image gallery with lightbox and thumbnail navigation

### 3.2 Component Features ✅ COMPLETED
- [x] **Search functionality**: Full-text search across title, description, and authors
- [x] **Image gallery**: Lightbox with thumbnail navigation for mod screenshots
- [x] **Download handling**: Direct browser opening for download URLs
- [x] **Responsive design**: Proper layout for different screen sizes
- [x] **Empty states**: Curated messages for no mods, no search results, no selection
- [x] **Loading states**: Smooth animations and progress indicators

### 3.3 UI/UX Enhancements ✅ COMPLETED
- [x] **Modern design**: Clean, dark-themed interface with proper spacing
- [x] **Interactive elements**: Hover states, transitions, and visual feedback
- [x] **Accessibility**: Proper ARIA labels and keyboard navigation
- [x] **Type safety**: Full TypeScript integration with proper interfaces
- [x] **Component composition**: Modular, reusable components with clear props

### 3.4 Service Layer ✅ COMPLETED
- [x] **RepositoryService**: TypeScript service for repository operations
- [x] **SearchService**: Advanced search and filtering logic
- [x] **ImageCacheService**: Image caching and management system
- [x] **Service integration**: Clean separation of concerns with service layer

### 3.5 Integration ✅ COMPLETED
- [x] **App.tsx updated**: Integrated all new components into main application
- [x] **State management**: Proper React state handling for search, selection, and repos
- [x] **Event handlers**: Complete interaction handling for all user actions
- [x] **Component exports**: Clean module structure with index.ts exports

**Additional Completed Items:**
- [x] 10 fully functional React components with TypeScript
- [x] Complete search and filtering system
- [x] Image lightbox with navigation
- [x] Repository management UI
- [x] Download and homepage link handling
- [x] Responsive layout with proper flexbox structure
- [x] Advanced search and filtering with debouncing
- [x] Image management with lazy loading and caching
- [x] Built-in mods system with automatic loading
- [x] Advanced UI components (AddRepoDialog, AdvancedFilters, LazyImage, ImageGallery)
- [x] Service layer (RepositoryService, SearchService, ImageCacheService)
- [x] Complete test suite with 21 passing tests

---

## PHASE 4: Mod Repository System ✅ COMPLETED

### 4.1 Backend Repository Management ✅ COMPLETED
- [x] **RepositoryManager**: Core service for fetching, caching, and managing repositories
- [x] **HTTP client integration**: Reqwest-based HTTP client for fetching remote repositories
- [x] **JSON parsing and validation**: Comprehensive validation of repository structure and mod data
- [x] **Local caching system**: Automatic caching of repositories to local filesystem
- [x] **Error handling**: Robust error handling with detailed error messages
- [x] **Tauri commands**: Complete set of async commands for repository operations

### 4.2 Repository Operations ✅ COMPLETED
- [x] **fetch_repository_command**: Fetch and validate repository from URL
- [x] **get_cached_repositories_command**: List all cached repositories with metadata
- [x] **load_cached_repository_command**: Load specific repository from cache
- [x] **clear_repository_cache_command**: Clear cache for specific repository
- [x] **clear_all_cache_command**: Clear all cached repositories
- [x] **Repository validation**: Validate repository structure, mod data, and required fields

### 4.3 Frontend Integration ✅ COMPLETED
- [x] **RepositoryService**: TypeScript service class for repository operations
- [x] **AddRepoDialog**: Modal dialog for adding new repositories with validation
- [x] **Repository management**: Add/remove repositories from configuration
- [x] **Mod loading**: Load mods from specific repositories or all repositories
- [x] **Search integration**: Search mods across all repositories
- [x] **Real-time updates**: Automatic refresh when repositories are added/removed

### 4.4 Data Management ✅ COMPLETED
- [x] **Type definitions**: Complete TypeScript interfaces for repositories and mods
- [x] **RepositoryInfo**: Metadata structure for repository listings
- [x] **RepositoryResponse**: Response structure for repository operations
- [x] **Mod data handling**: Full mod data structure with downloads, images, requirements
- [x] **Cache management**: Automatic cache directory creation and file management
- [x] **Configuration integration**: Repository URLs stored in app configuration

### 4.5 Test Repository ✅ COMPLETED
- [x] **Sample repository**: Created `public/mods.json` with realistic mod data
- [x] **Built-in integration**: Automatic loading as built-in repository
- [x] **Test data**: Realistic mod data with images, requirements, and metadata
- [x] **Development support**: Local repository for testing and development

**Additional Completed Items:**
- [x] HTTP client with proper error handling and timeout management
- [x] JSON schema validation for repository structure
- [x] Local filesystem caching with automatic directory creation
- [x] Repository metadata extraction (name, version, mod count)
- [x] Cross-platform cache directory handling (Windows/macOS)
- [x] Async/await pattern throughout the codebase
- [x] Comprehensive error messages and user feedback
- [x] Built-in mods system with automatic `mods.json` loading
- [x] Repository service layer with TypeScript integration
- [x] Test repository functionality for development and testing
- [x] Sample repository with realistic mod data for testing
- [x] Built-in repository integration with special handling

---

## PHASE 5: Advanced Features ✅ COMPLETED

### 5.1 Search and Filters ✅ COMPLETED
- [x] **Search Engine**:
  - [x] Full-text search on title + description + authors + requirements
  - [x] Filter by requirements (multiple selection)
  - [x] Filter by authors (multiple selection)
  - [x] Sort by date/alphabetical/relevance
- [x] **Performance**:
  - [x] Debounce for search input (300ms)
  - [x] Memoized results
  - [x] Efficient filtering algorithms
- [x] **Advanced Features**:
  - [x] SearchService with comprehensive filtering logic
  - [x] AdvancedFilters component with dropdown interface
  - [x] Real-time search with instant results
  - [x] Clear filters functionality

### 5.2 Image Management ✅ COMPLETED
- [x] **Image Gallery**:
  - [x] Lazy loading of images with Intersection Observer
  - [x] Placeholder during loading with SVG fallbacks
  - [x] Lightbox for fullscreen viewing with keyboard navigation
  - [x] Loading error handling with fallback images
  - [x] ImageGallery component with thumbnail navigation
  - [x] Fixed aspect ratio issues and layout stability
- [x] **Caching**:
  - [x] Local image cache with localStorage
  - [x] Automatic cache cleanup (7-day expiration)
  - [x] Cache size management (50MB limit)
  - [x] Preloading for better performance
  - [x] ImageCacheService with comprehensive cache management
- [x] **LazyImage Component**:
  - [x] Intersection Observer integration
  - [x] Automatic image caching
  - [x] Error handling and fallbacks
  - [x] Click handling for lightbox integration

### 5.3 Built-in and Official Repository System ✅ COMPLETED
- [x] **Local Mod Repository**:
  - [x] Automatic loading of `public/mods.json` as built-in repository
  - [x] Built-in repository with `repo_id: "built-in"` for identification
  - [x] Seamless integration with remote repositories
  - [x] Special "Built-in" badge in repository selector
- [x] **Official GitHub Repository**:
  - [x] Hardcoded official repository URL: `https://raw.githubusercontent.com/FrancescoGrazioso/SilkSpool-sources/refs/heads/main/silkspool-sources.json`
  - [x] Automatic loading on app startup (always up-to-date)
  - [x] Official repository with `repo_id: "official"` for identification
  - [x] Special "Official" badge in repository selector
  - [x] Highest priority in repository loading order
- [x] **Repository Management**:
  - [x] Built-in and official repositories automatically loaded on app startup
  - [x] Combined with remote repositories in unified mod list
  - [x] Proper repository metadata and mod counting
  - [x] Priority order: Official → Built-in → User-added repositories
  - [x] Smart visibility: Built-in repository hidden if mod list is empty

### 5.4 Mod Installation and Management System ✅ COMPLETED
- [x] **Mod Installation**:
  - [x] Download mod files from URLs with progress tracking
  - [x] Automatic decompression (ZIP, TAR.GZ) support
  - [x] File extraction to BepInEx plugins folder
  - [x] Progress notifications with download percentage
  - [x] Error handling and user feedback
- [x] **Installed Mods Tracking**:
  - [x] Persistent storage of installed mods data
  - [x] Version tracking and installation timestamps
  - [x] File path tracking for uninstallation
  - [x] Real-time UI updates for installed status
  - [x] "Installed" filter for showing only installed mods
- [x] **Mod Uninstallation**:
  - [x] Uninstall button for installed mods in ModDetail
  - [x] Confirmation dialog for uninstall action
  - [x] Complete file removal from BepInEx plugins folder
  - [x] Automatic tracking cleanup after uninstall
  - [x] Success/error notifications for uninstall process
- [x] **UI Enhancements**:
  - [x] Install/Uninstall button states based on mod status
  - [x] "Installed" badges on mod items
  - [x] Loading states for installation/uninstallation
  - [x] Version display in notifications

### 5.5 Bug Fixes and Improvements ✅ COMPLETED
- [x] **Initial Mod Loading Bug**:
  - [x] Fixed filtered mods not showing on startup
  - [x] Proper initialization of search and filter states
  - [x] Default to "All Repositories" instead of first repo
- [x] **UI Improvements**:
  - [x] Fixed "Built-in" badge wrapping issue
  - [x] Increased dropdown width for better spacing
  - [x] Improved repository selector layout
- [x] **Image Rendering Fixes**:
  - [x] Fixed image aspect ratio issues in ModDetail component
  - [x] Implemented fixed space for images to prevent layout jumps
  - [x] Added proper image fitting with object-contain
  - [x] Added left padding to thumbnail list to prevent border cutoff
- [x] **Component Integration**:
  - [x] Refactored ModDetail to use ImageGallery component
  - [x] Improved component composition and reusability
  - [x] Enhanced error handling and user feedback
- [x] **Tauri Compatibility Fixes**:
  - [x] Fixed window.confirm() not working in Tauri
  - [x] Replaced with native confirmation dialogs
  - [x] Fixed URL opening with Tauri opener plugin
  - [x] Proper error handling for Tauri-specific APIs
- [x] **UI Improvements**:
  - [x] Fixed URL truncation bug in repository selector dropdown
  - [x] URLs truncated to 60 characters with tooltip showing full URL
  - [x] Added link to SilkSpool Sources repository in README
- [x] **Modular Download System**:
  - [x] Implemented automatic host type detection (MediaFire, GitHub, Dropbox, Google Drive)
  - [x] Added HTML parsing to extract direct download URLs from download pages
  - [x] Created URL conversion functions for different cloud storage services
  - [x] Added support for direct download links and unknown hosts
  - [x] Enhanced error handling with informative messages for unsupported hosts

---

## PHASE 6: Testing and Quality 🔄 IN PROGRESS

### 6.1 Rust Backend Testing ✅ COMPLETED
- [x] **Unit Tests**:
  - [x] Basic struct creation tests
  - [x] Type validation tests
  - [x] Repository structure tests
  - [x] Configuration serialization tests
  - [x] Fixed existing failing tests (BepInEx detection, regex patterns)
  - [x] All 8 Rust tests passing
- [ ] **Integration Tests**:
  - [ ] End-to-end detection tests
  - [ ] Filesystem mocks for testing
  - [ ] Cross-platform tests

### 6.2 React Frontend Testing ✅ COMPLETED
- [x] **Test Infrastructure Setup**:
  - [x] Vitest configuration with jsdom environment
  - [x] Testing Library setup with proper mocks
  - [x] Basic test framework with setup files
  - [x] Tauri API mocks for testing
  - [x] Intersection Observer mocks
- [x] **Component Tests**:
  - [x] SearchBar component tests (6/6 passing)
  - [x] ModItem component tests (7/7 passing)
  - [x] RepoSelector component tests (7/7 passing)
  - [x] Basic test framework (1/1 passing)
- [x] **Test Environment**:
  - [x] Fixed jsdom compatibility with Node.js
  - [x] Complete component test execution (21/21 tests passing)
  - [x] Proper test isolation and cleanup
- [ ] **E2E Tests**:
  - [ ] Complete app flow tests
  - [ ] Path selection tests
  - [ ] Repository management tests

### 6.3 Linting and Formatting
- [ ] **Rust**:
  - [ ] Configure `clippy` for linting
  - [ ] `rustfmt` for formatting
  - [ ] Pre-commit hooks
- [ ] **TypeScript/React**:
  - [ ] ESLint configuration
  - [ ] Prettier for formatting
  - [ ] Strict type checking

---

## PHASE 7: Build and Distribution

### 7.1 Build Configuration
- [ ] **Tauri Build**:
  - [ ] Configure `tauri.conf.json` for build
  - [ ] Release optimizations
  - [ ] Bundle size optimization
- [ ] **Cross-platform**:
  - [ ] Build Windows x64
  - [ ] Build macOS universal (arm64 + x64)
  - [ ] Test on both platforms

### 7.2 Packaging
- [ ] **Windows**:
  - [ ] Generate .exe installer
  - [ ] Configure desktop shortcut
  - [ ] Test installation/uninstallation
- [ ] **macOS**:
  - [ ] Generate .app bundle
  - [ ] Configure Info.plist
  - [ ] Test on different macOS versions

### 7.3 Documentation
- [ ] **README.md**:
  - [ ] Installation instructions
  - [ ] System requirements
  - [ ] Usage guides
- [ ] **CHANGELOG.md**:
  - [ ] Versions and changelog
  - [ ] Release notes
- [ ] **API Documentation**:
  - [ ] Rust functions documentation
  - [ ] React components documentation

---

## PHASE 8: Finalization and Release

### 8.1 Final Testing
- [ ] **User Testing**:
  - [ ] Test on clean machines
  - [ ] Test with different Steam installations
  - [ ] Test with/without BepInEx
- [ ] **Performance**:
  - [ ] Loading speed tests
  - [ ] Memory usage tests
  - [ ] CPU usage tests

### 8.2 Release Preparation
- [ ] **Versioning**:
  - [ ] Git tag for version
  - [ ] Updated changelog
  - [ ] Release notes
- [ ] **Distribution**:
  - [ ] Upload to GitHub Releases
  - [ ] Prepare download links
  - [ ] Updated documentation

---

## Acceptance Criteria - Final Checklist

### ✅ Automatic Game Detection
- [ ] App automatically detects Steam installations
- [ ] Shows game path if found
- [ ] Allows manual selection if not found
- [ ] Saves last valid path

### ✅ BepInEx Detection
- [ ] Verifies BepInEx presence on Windows and macOS
- [ ] Shows warning banner if missing
- [ ] Links to official BepInEx guides
- [ ] Distinguishes between "present" and "initialized"

### ✅ Mod Management
- [ ] Mod list with full-text search
- [ ] Mod details with images (max 5)
- [ ] Download button that opens browser
- [ ] Support for multiple repos with deduplication

### ✅ UI/UX
- [ ] Modern layout like macOS Settings
- [ ] Dark mode by default
- [ ] Responsive down to 900x600
- [ ] Curated empty states
- [ ] Visual feedback for all actions

### ✅ Cross-platform
- [ ] Working Windows x64 build
- [ ] Working macOS universal build
- [ ] Tested on both platforms
- [ ] Cross-platform path handling

---

## Technical Notes and Considerations

### Security
- No execution of downloaded binaries
- Open URLs in system browser
- User input validation
- Path sanitization

### Performance
- Virtualized list for mods
- Lazy loading images
- Local cache for repos
- Debounce for search

### Maintainability
- Well-documented code
- Frontend/backend logic separation
- Type safety with TypeScript
- Robust error handling

### Extensibility
- Modular architecture
- Clear APIs for future extensions
- Flexible configuration
- Support for new repo formats

---

## Estimated Timeline

- **Phase 1-2**: Setup and Backend (3-4 days)
- **Phase 3**: Frontend UI (4-5 days)
- **Phase 4**: Repository System (2-3 days)
- **Phase 5**: Advanced Features (2-3 days)
- **Phase 6**: Testing (2-3 days)
- **Phase 7**: Build and Distribution (1-2 days)
- **Phase 8**: Finalization (1 day)

**Total estimated**: 15-21 days of development

---

*This document will be updated during development to track progress and add missing details.*
