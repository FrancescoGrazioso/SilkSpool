# Build and Release Documentation - Silk Spool

## 📋 Overview

This document describes the complete build and release process for Silk Spool, including automated builds, code signing, and distribution.

## 🛠️ Build System

### Local Build Process

#### Prerequisites

- **Node.js**: Version 20.19+ or 22.12+ (required by Vite)
- **Rust**: Latest stable version
- **Tauri CLI**: `npm install -g @tauri-apps/cli`
- **macOS**: Apple Development certificate for code signing

#### Build Commands

```bash
# Navigate to project directory
cd silk-spool

# Install dependencies
npm install

# Build for current platform
npm run tauri build

# Development build
npm run tauri dev
```

### Automated Build Script

**File**: `build-release.sh`

The build script automates the entire build process:

1. **Clean previous builds**
2. **Build the application** using Tauri
3. **Sign the app bundle** (macOS only)
4. **Copy release files** to release directory
5. **Create checksums** for verification
6. **Generate release notes**

#### Usage

```bash
./build-release.sh
```

#### Output

- **macOS**: `SilkSpool-{version}-macOS-ARM64.dmg`
- **Windows**: `SilkSpool-{version}-Windows-x64.msi` (via GitHub Actions)
- **Checksums**: SHA256 files for verification

## 🔐 Code Signing

### macOS Code Signing

#### Configuration

**File**: `silk-spool/src-tauri/tauri.conf.json`

```json
{
  "bundle": {
    "macOS": {
      "signingIdentity": "Apple Development: francescograzioso1995@gmail.com (DG5SNSM874)"
    }
  }
}
```

#### Process

1. **Automatic Signing**: Tauri signs the app bundle during build
2. **Certificate**: Uses Apple Development certificate (free)
3. **Limitation**: App is signed but not notarized (requires paid Developer account)

#### Verification

```bash
# Check app signature
codesign --verify --deep --strict --verbose=2 "/path/to/Silk Spool.app"

# Check Gatekeeper acceptance
spctl --assess --verbose "/path/to/SilkSpool.dmg"
```

### Windows Code Signing

Windows MSI files are built via GitHub Actions and are not currently signed.

## 🚀 Release Process

### GitHub Actions Workflows

#### 1. Build and Release (`build-release.yml`)

**Trigger**: Push to tags, manual dispatch

**Features**:

- Multi-platform builds (macOS ARM64, macOS Intel, Windows x64)
- Automatic artifact upload
- 30-day artifact retention

#### 2. Create Release (`create-release.yml`)

**Trigger**: Manual dispatch

**Features**:

- Downloads build artifacts
- Creates GitHub release
- Uploads binaries to release

### Manual Release Process

#### 1. Update Version

Update version in:

- `silk-spool/package.json`
- `silk-spool/src-tauri/Cargo.toml`
- `build-release.sh`

#### 2. Create Tag

```bash
git tag v{version}
git push origin v{version}
```

#### 3. Build Locally

```bash
./build-release.sh
```

#### 4. Create Release

```bash
gh release create v{version} \
  --title "Silk Spool v{version}" \
  --notes-file releases/v{version}/RELEASE_NOTES.md \
  --prerelease \
  ./releases/v{version}/*
```

## 📦 Distribution

### Release Files

#### macOS

- **File**: `SilkSpool-{version}-macOS-ARM64.dmg`
- **Format**: Universal DMG (works on both Intel and Apple Silicon)
- **Size**: ~5.7 MB
- **Installation**: Drag to Applications folder

#### Windows

- **File**: `Silk.Spool.{version}.Windows.msi`
- **Format**: MSI installer
- **Installation**: Run installer, follow wizard

### Release Notes Template

```markdown
## 🚀 Silk Spool v{version}

### 🐛 Bug Fixes

- List of bug fixes

### ✨ New Features

- List of new features

### 🔧 Technical Improvements

- List of technical improvements

### 🍎 macOS Installation Notes

[Include Gatekeeper instructions]

### 🪟 Windows Installation

[Include Windows installation steps]

### 📋 System Requirements

- **macOS**: macOS 10.15+ (ARM64 or Intel)
- **Windows**: Windows 10+ (x64)
- **Hollow Knight: Silksong**: Steam installation
- **BepInEx**: Will be detected automatically

### 🤝 Feedback

This is a beta release! Please report any issues or suggestions on GitHub Issues.

**Thank you for trying Silk Spool!** 🎮✨
```

## 🔍 Troubleshooting

### Common Build Issues

#### Node.js Version

**Error**: `You are using Node.js 20.0.0. Vite requires Node.js version 20.19+ or 22.12+`

**Solution**: Update Node.js to version 20.19+ or 22.12+

#### Tauri Build Failures

**Error**: `failed to bundle project`

**Solution**:

1. Clean build directory: `rm -rf src-tauri/target/release/bundle/`
2. Rebuild: `npm run tauri build`

#### Code Signing Issues

**Error**: `No Apple Development certificate found`

**Solution**:

1. Check certificates: `security find-identity -v -p codesigning`
2. Update certificate in `tauri.conf.json`

### Release Issues

#### GitHub Actions Failures

**Error**: `Resource not accessible by integration`

**Solution**: Use manual release creation workflow

#### DMG Gatekeeper Issues

**Error**: App appears "damaged"

**Solution**: See [macOS Gatekeeper Guide](MACOS_GATEKEEPER_GUIDE.md)

## 📚 References

- [Tauri Build Guide](https://tauri.app/v1/guides/building/)
- [Apple Code Signing](https://developer.apple.com/library/archive/documentation/Security/Conceptual/CodeSigningGuide/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [macOS Gatekeeper Guide](MACOS_GATEKEEPER_GUIDE.md)

---

**Last updated**: September 24, 2025  
**Version**: v0.3.0  
**Status**: Complete and documented
