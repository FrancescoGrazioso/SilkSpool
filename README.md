# Silk Spool

A beautiful, easy-to-use mod manager for Hollow Knight: Silksong. Find, download, and manage your favorite mods with just a few clicks!


![Silk Spool](https://img.shields.io/badge/Status-In%20Development-orange)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS-blue)
![Game](https://img.shields.io/badge/Game-Hollow%20Knight%3A%20Silksong-purple)

<img width="798" height="506" alt="Screenshot 2025-09-20 alle 21 51 11" src="https://github.com/user-attachments/assets/72ab1a5e-6e04-4808-916f-1046feeaa3f4" />

## What is Silk Spool?

Silk Spool is a desktop application that makes modding Hollow Knight: Silksong simple and enjoyable. Whether you're new to modding or a seasoned veteran, Silk Spool provides an intuitive interface to discover and manage your mods.

## ✨ Key Features

### 🎮 **Automatic Setup**
- **Smart Game Detection**: Automatically finds your Hollow Knight: Silksong installation
- **BepInEx Integration**: Checks if BepInEx is properly installed and configured
- **One-Click Setup**: Get started in minutes, not hours

### 📚 **Mod Discovery**
- **Browse Mods**: Explore mods from multiple repositories in one place
- **Official Repository**: Pre-loaded official mod repository with curated content
- **Advanced Search**: Find exactly what you're looking for with powerful search tools
- **Smart Filtering**: Filter by repository, requirements, authors, and installation status
- **Rich Details**: View screenshots, descriptions, and requirements before downloading

### 🎨 **Beautiful Interface**
- **Dark Theme**: Easy on the eyes during long modding sessions
- **Responsive Design**: Works perfectly on any screen size
- **Intuitive Navigation**: Simple, clean interface that anyone can use

### 🔧 **Complete Mod Management**
- **Repository Support**: Add your favorite mod sources with official and built-in mods included
- **One-Click Installation**: Download, decompress, and install mods automatically
- **Smart Uninstallation**: Remove mods completely with confirmation dialogs
- **Progress Tracking**: Real-time download progress and installation status
- **Installed Mod Tracking**: Keep track of what's installed, when, and which version
- **Status Indicators**: Visual badges and filters to see your installed mods

### 🔔 **Enhanced User Experience**
- **Notification System**: Real-time feedback on downloads and installations
- **Error Handling**: Clear error messages and recovery suggestions
- **Loading States**: Visual feedback during all operations
- **Image Gallery**: Browse mod screenshots with lazy loading and lightbox view

## 🚀 Getting Started

### Prerequisites
- **Hollow Knight: Silksong** (installed via Steam)
- **BepInEx** (for modding support)
- **Windows 10/11** or **macOS 10.15+**

### Installation

1. **Download** the latest release from the [Releases page](https://github.com/FrancescoGrazioso/SilkSpool/releases)
2. **Install** the application for your platform:
   - **Windows**: Run the `.msi` installer
   - **macOS**: Open the `.dmg` file and drag to Applications
3. **Launch** Silk Spool and let it detect your game automatically
4. **Add repositories** to start browsing mods
5. **Enjoy** your modded Silksong experience!

## 📖 How to Use

### First Launch
1. Silk Spool will automatically scan for your Hollow Knight: Silksong installation
2. If found, it will check for BepInEx compatibility
3. If not found, you can manually select your game folder

### Adding Mod Repositories
1. Click the **"Add Repository"** button
2. Enter the URL of a mod repository (JSON format)
3. Silk Spool will fetch and cache the mod list
4. Start browsing and downloading mods!

### Finding and Installing Mods
- Use the **search bar** to find specific mods
- **Filter by repository** to focus on specific sources
- **Filter by installed status** to see what you have
- **Browse by category** or **sort by date/name**
- Click on any mod to see **detailed information** and **screenshots**
- **Click "Download"** to automatically install the mod
- **Click "Uninstall"** to remove installed mods

### Managing Your Mods
- **View installed mods** with the "Installed" filter
- **See installation dates** and versions in mod details
- **Uninstall mods** with a single click and confirmation
- **Track mod status** with visual indicators and badges

## 🛠️ For Developers

### Development Status
**Current Progress**: 80% Complete (5/8 phases completed, Phase 6 in progress)

**Completed Features:**
- ✅ Game detection and BepInEx validation
- ✅ Repository management system with official and built-in mods
- ✅ Modern UI with advanced search and filtering
- ✅ Cross-platform support (Windows & macOS)
- ✅ **Mod installation system** with progress tracking
- ✅ **Mod uninstallation system** with confirmation dialogs
- ✅ **Installed mods tracking** with persistent storage
- ✅ **Image management** with lazy loading and caching
- ✅ **Notification system** for user feedback
- ✅ **Official repository integration** with automatic loading
- ✅ **Comprehensive testing** (Rust backend + React frontend)

**In Progress:**
- 🔄 Linting and formatting setup
- 🔄 Build and distribution optimization

**Coming Soon:**
- 🔄 Automated builds and installers
- 🔄 Final polish and public release

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### For Users
- **Report bugs** or issues you encounter
- **Suggest new features** that would improve your experience
- **Share feedback** on the user interface and functionality
- **Help other users** in discussions and issues

### For Developers
- **Fork the repository** and create a feature branch
- **Follow the coding standards** and test your changes
- **Submit pull requests** with clear descriptions
- **Help with documentation** and examples

### Development Setup
If you want to contribute code:

1. **Clone the repository**:
```bash
git clone https://github.com/FrancescoGrazioso/SilkSpool.git
cd SilkSpool/silk-spool
```

2. **Install dependencies**:
```bash
npm install
```

3. **Run in development mode**:
```bash
npm run tauri dev
```

## 📋 Roadmap

### ✅ Phase 5: Advanced Features (COMPLETED)
- ✅ Mod installation and management system
- ✅ Mod uninstallation with confirmation dialogs
- ✅ Installed mods tracking and persistence
- ✅ Advanced search and filtering
- ✅ Image management with lazy loading
- ✅ Notification system for user feedback
- ✅ Built-in and official mods repository system

### 🔄 Phase 6: Testing and Quality (IN PROGRESS)
- ✅ Comprehensive testing suite (Rust + React)
- ✅ Performance optimization
- ✅ Bug fixes and stability improvements
- 🔄 Linting and formatting setup
- 🔄 Code quality improvements

### ⏳ Phase 7: Build and Distribution (PENDING)
- ⏳ Automated builds for all platforms
- ⏳ Installer creation (.msi for Windows, .dmg for macOS)
- ⏳ Update system implementation
- ⏳ Release automation

### ⏳ Phase 8: Finalization and Release (PENDING)
- ⏳ Final polish and optimization
- ⏳ Documentation completion
- ⏳ Public release preparation
- ⏳ Community feedback integration

## 🐛 Known Issues

- Cross-platform testing is ongoing
- Some advanced features like mod dependencies are planned for future versions
- Performance optimization for large mod repositories is in progress

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🛠️ Technology Stack

- **Framework**: [Tauri](https://tauri.app/) - Modern desktop app framework
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Rust for system integration and performance
- **Storage**: Local JSON files with persistent mod tracking
- **Testing**: Vitest + Rust unit tests
- **Build**: Cross-platform (Windows x64, macOS universal)

## 🙏 Acknowledgments

- Built with [Tauri](https://tauri.app/) - the modern desktop app framework
- UI styled with [Tailwind CSS](https://tailwindcss.com/)
- Inspired by the Hollow Knight modding community
- Special thanks to all contributors and testers

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/FrancescoGrazioso/SilkSpool/issues)
- **Discussions**: [GitHub Discussions](https://github.com/FrancescoGrazioso/SilkSpool/discussions)
- **Releases**: [GitHub Releases](https://github.com/FrancescoGrazioso/SilkSpool/releases)
- **Mod Sources**: [SilkSpool Sources Repository](https://github.com/FrancescoGrazioso/SilkSpool-sources)

---

**Made with ❤️ for the Hollow Knight: Silksong modding community**
