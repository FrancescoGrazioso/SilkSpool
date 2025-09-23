# Silk Spool - Build Instructions

## 🏗️ Building for Different Platforms

### macOS (Current Platform)
```bash
# Build locally on macOS
cd silk-spool
npm run tauri build
# Generates: Silk Spool_0.1.0_aarch64.dmg
```

### Windows
**Option 1: GitHub Actions (Recommended)**
```bash
# Create a tag to trigger automated build
git tag v0.1.1
git push origin v0.1.1
# GitHub Actions will build for Windows automatically
```

**Option 2: Local Windows Build**
```bash
# On a Windows machine with Rust and Node.js installed
cd silk-spool
npm run tauri build
# Generates: Silk Spool_0.1.0_x64_en-US.msi
```

### Cross-Platform Build Limitations

- **macOS**: Can only build macOS DMG files
- **Windows**: Can only build Windows MSI files  
- **Linux**: Can only build Linux AppImage files

### Automated Multi-Platform Builds

The easiest way to build for all platforms is using GitHub Actions:

1. **Push a tag** to trigger the build:
   ```bash
   git tag v0.1.1
   git push origin v0.1.1
   ```

2. **GitHub Actions will automatically**:
   - Build for macOS (ARM64 and x86_64)
   - Build for Windows (x64)
   - Create a draft release with all files
   - Upload the built applications

3. **Publish the release** from GitHub's web interface

### Manual Build Process

If you need to build manually:

#### Prerequisites
- **Node.js**: 20.19+ or 22.12+
- **Rust**: Latest stable
- **Tauri CLI**: `npm install -g @tauri-apps/cli`

#### Build Commands
```bash
# Install dependencies
cd silk-spool
npm install

# Build frontend
npm run build

# Build Tauri app
npm run tauri build
```

#### Output Files
- **macOS**: `src-tauri/target/release/bundle/dmg/Silk Spool_0.1.0_aarch64.dmg`
- **Windows**: `src-tauri/target/release/bundle/msi/Silk Spool_0.1.0_x64_en-US.msi`

### Troubleshooting

#### Build Fails on macOS
- Check Node.js version: `node --version`
- Check Rust version: `rustc --version`
- Clean build: `rm -rf src-tauri/target/ && npm run tauri build`

#### Build Fails on Windows
- Install Visual Studio Build Tools
- Install Windows SDK
- Check PATH includes Rust and Node.js

#### GitHub Actions Fails
- Check workflow file syntax
- Verify repository secrets
- Check build logs in Actions tab

### Release Process

1. **Update version** in `package.json` and `Cargo.toml`
2. **Test locally** on your platform
3. **Create tag** and push to trigger GitHub Actions
4. **Review draft release** on GitHub
5. **Publish release** when ready

### File Sizes
- **macOS DMG**: ~5.2 MB
- **Windows MSI**: ~5.5 MB (estimated)
- **Source Code**: ~2 MB

### Security Notes
- All builds are signed with GitHub's certificates
- Checksums are generated for integrity verification
- Releases are marked as pre-release for beta versions
