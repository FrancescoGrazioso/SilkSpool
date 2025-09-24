#!/bin/bash

# Silk Spool - Build and Release Script
# This script builds the application for all platforms and prepares files for GitHub release

set -e  # Exit on any error

echo "🚀 Starting Silk Spool Build Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "silk-spool/package.json" ]; then
    print_error "Please run this script from the SilkSpool root directory"
    exit 1
fi

# Create release directory
RELEASE_DIR="releases/v0.3.0"
print_status "Creating release directory: $RELEASE_DIR"
mkdir -p "$RELEASE_DIR"

# Navigate to the app directory
cd silk-spool

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf src-tauri/target/release/bundle/
rm -rf dist/

# Build the application
print_status "Building Silk Spool for current platform (macOS)..."
print_warning "Note: Windows MSI can only be built on Windows or via GitHub Actions"
npm run tauri build

# Sign the app bundle to avoid Gatekeeper issues
print_status "Signing app bundle to avoid Gatekeeper issues..."
if command -v codesign &> /dev/null; then
    # Check if we have a development certificate
    CERT_ID=$(security find-identity -v -p codesigning | grep "Apple Development" | head -1 | awk '{print $2}')
    if [ ! -z "$CERT_ID" ]; then
        if [ -d "src-tauri/target/release/bundle/macos/Silk Spool.app" ]; then
            codesign --force --sign "$CERT_ID" "src-tauri/target/release/bundle/macos/Silk Spool.app"
            if [ $? -eq 0 ]; then
                print_success "App bundle signed successfully"
            else
                print_warning "Failed to sign app bundle, but build will continue"
            fi
        fi
    else
        print_warning "No Apple Development certificate found, app bundle will not be signed"
    fi
else
    print_warning "codesign not available, app bundle will not be signed"
fi

# Check if build was successful
if [ $? -eq 0 ]; then
    print_success "Build completed successfully!"
else
    print_error "Build failed!"
    exit 1
fi

# Copy release files to release directory
print_status "Copying release files..."

# macOS DMG
if [ -f "src-tauri/target/release/bundle/dmg/Silk Spool_0.3.0_aarch64.dmg" ]; then
    cp "src-tauri/target/release/bundle/dmg/Silk Spool_0.3.0_aarch64.dmg" "../$RELEASE_DIR/SilkSpool-0.3.0-macOS-ARM64.dmg"
    
    # Note: DMG signing is not needed since we sign the app bundle before creating the DMG
    print_status "DMG created with signed app bundle"
    
    print_success "macOS ARM64 DMG copied and signed"
fi

# macOS App Bundle
if [ -d "src-tauri/target/release/bundle/macos/Silk Spool.app" ]; then
    cp -r "src-tauri/target/release/bundle/macos/Silk Spool.app" "../$RELEASE_DIR/"
    print_success "macOS App Bundle copied"
fi

# Windows MSI (if available)
if [ -f "src-tauri/target/release/bundle/msi/Silk Spool_0.3.0_x64_en-US.msi" ]; then
    cp "src-tauri/target/release/bundle/msi/Silk Spool_0.3.0_x64_en-US.msi" "../$RELEASE_DIR/SilkSpool-0.3.0-Windows-x64.msi"
    print_success "Windows MSI copied"
fi

# Create release notes
print_status "Creating release notes..."
cat > "../$RELEASE_DIR/RELEASE_NOTES.md" << EOF
# Silk Spool v0.3.0 - Beta Release

## 🎉 What's New

This the beta release of Silk Spool, a beautiful mod manager for Hollow Knight: Silksong!

### ✨ Key Features

- **🎮 Automatic Setup**: Smart detection of Hollow Knight: Silksong and BepInEx installations
- **📚 Mod Discovery**: Browse mods from multiple repositories with advanced search and filtering
- **🔧 Complete Mod Management**: One-click installation and uninstallation with progress tracking
- **🎨 Beautiful Interface**: Dark theme with responsive design
- **🔔 Real-time Updates**: Live UI updates when mods are installed/uninstalled
- **📱 Cross-platform**: Works on Windows and macOS

### 🚀 Installation

#### macOS
1. Download \`SilkSpool-0.3.0-macOS-ARM64.dmg\`
2. Open the DMG file
3. If macOS shows a security warning, right-click the DMG and select "Open" or go to System Preferences > Security & Privacy and click "Open Anyway"
4. Drag Silk Spool to your Applications folder
5. Launch the app from Applications

#### Windows
1. Download \`SilkSpool-0.3.0-Windows-x64.msi\`
2. Run the MSI installer
3. Follow the installation wizard
4. Launch Silk Spool from Start Menu

### 📋 System Requirements

- **macOS**: macOS 10.15+ (ARM64 or Intel)
- **Windows**: Windows 10+ (x64)
- **Hollow Knight: Silksong**: Steam installation
- **BepInEx**: Will be detected automatically

### 🐛 Known Issues

- Some download hosts may require manual intervention
- First launch may take longer due to initial setup
- Some mods may require additional dependencies

### 🤝 Feedback

This is a beta release! Please report any issues or suggestions:
- GitHub Issues: [Create an issue](https://github.com/FrancescoGrazioso/SilkSpool/issues)
- Email: [Your email here]

### 📝 Changelog

#### v0.3.0 (Beta Release)
- Initial beta release
- Complete mod management system
- Cross-platform support
- Official repository integration
- Real-time UI updates
- Advanced search and filtering

---

**Thank you for trying Silk Spool!** 🎮✨
EOF

# Create checksums
print_status "Creating checksums..."
cd "../$RELEASE_DIR"
find . -name "*.dmg" -o -name "*.msi" -o -name "*.app" | while read file; do
    if [ -f "$file" ]; then
        shasum -a 256 "$file" > "${file}.sha256"
        print_success "Created checksum for $file"
    fi
done

# Go back to root
cd ../..

# Display summary
print_success "🎉 Release build completed!"
print_status "Release files are in: $RELEASE_DIR"
echo ""
print_status "Files created:"
ls -la "$RELEASE_DIR"
echo ""
print_warning "Next steps:"
echo "1. Test the built applications"
echo "2. Create a GitHub release"
echo "3. Upload the files to GitHub"
echo ""
print_status "To create a GitHub release, run:"
echo "gh release create v0.3.0 $RELEASE_DIR/* --title 'Silk Spool v0.3.0 - Beta Release' --notes-file $RELEASE_DIR/RELEASE_NOTES.md"
echo ""
print_warning "IMPORTANT: Do NOT commit the releases/ directory to Git!"
echo "Release files should only be uploaded to GitHub Releases, not committed to the repository."
