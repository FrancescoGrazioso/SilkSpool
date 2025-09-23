# Silk Spool - Release Guide

## 🚀 How to Create a Release

### Method 1: Using the Build Script (Recommended)

1. **Run the build script:**
   ```bash
   ./build-release.sh
   ```

2. **Test the built applications:**
   - Test the macOS DMG on macOS
   - Test the Windows MSI on Windows (if available)

3. **Create GitHub release:**
   ```bash
   # Install GitHub CLI if not already installed
   brew install gh  # macOS
   # or
   winget install GitHub.cli  # Windows
   
   # Login to GitHub
   gh auth login
   
   # Create the release
   gh release create v0.1.0 releases/v0.1.0/* \
     --title "Silk Spool v0.1.0 - Beta Release" \
     --notes-file releases/v0.1.0/RELEASE_NOTES.md \
     --prerelease
   ```

### Method 2: Manual Build

1. **Build the application:**
   ```bash
   cd silk-spool
   npm run tauri build
   ```

2. **Find the built files:**
   - macOS: `src-tauri/target/release/bundle/dmg/Silk Spool_0.1.0_aarch64.dmg`
   - Windows: `src-tauri/target/release/bundle/msi/Silk Spool_0.1.0_x64_en-US.msi`

3. **Create release manually on GitHub:**
   - Go to your GitHub repository
   - Click "Releases" → "Create a new release"
   - Tag: `v0.1.0`
   - Title: `Silk Spool v0.1.0 - Beta Release`
   - Upload the built files
   - Mark as "Pre-release" for beta versions

### Method 3: Automated with GitHub Actions

1. **Create and push a tag:**
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

2. **GitHub Actions will automatically:**
   - Build for all platforms
   - Create a draft release
   - Upload the built files
   - You just need to publish the draft release

## 📁 Release File Structure

```
releases/                                  # ⚠️ NOT committed to Git
└── v0.1.0/
    ├── SilkSpool-0.1.0-macOS-ARM64.dmg
    ├── SilkSpool-0.1.0-Windows-x64.msi
    ├── Silk Spool.app/                    # macOS App Bundle
    ├── RELEASE_NOTES.md
    ├── SilkSpool-0.1.0-macOS-ARM64.dmg.sha256
    └── SilkSpool-0.1.0-Windows-x64.msi.sha256
```

**⚠️ IMPORTANT**: The `releases/` directory is in `.gitignore` and should NOT be committed to Git. Release files are only uploaded to GitHub Releases.

## 🔧 Build Configuration

### Tauri Configuration
The build is configured in `silk-spool/src-tauri/tauri.conf.json`:

```json
{
  "bundle": {
    "active": true,
    "targets": ["msi", "dmg"],
    "category": "Games",
    "shortDescription": "BepInEx mod manager for Hollow Knight: Silksong"
  }
}
```

### Supported Platforms
- **macOS**: ARM64 (Apple Silicon) and x86_64 (Intel)
- **Windows**: x64 (64-bit)

## 📋 Pre-Release Checklist

Before creating a release:

- [ ] All tests pass
- [ ] Version numbers are updated in `package.json` and `Cargo.toml`
- [ ] README.md is up to date
- [ ] CHANGELOG.md is updated (if exists)
- [ ] Built applications are tested on target platforms
- [ ] Release notes are written
- [ ] GitHub repository is up to date

## 🐛 Troubleshooting

### Build Fails
- Check Node.js version (requires 20.19+ or 22.12+)
- Check Rust toolchain is up to date
- Check all dependencies are installed

### Missing Files
- Ensure Tauri configuration includes all target platforms
- Check build logs for errors
- Verify file paths in the build script

### GitHub Release Issues
- Ensure GitHub CLI is authenticated
- Check repository permissions
- Verify tag format (should be `v0.1.0`)

## 📝 Release Notes Template

```markdown
# Silk Spool v0.1.0 - Beta Release

## 🎉 What's New
[Describe new features]

## 🐛 Bug Fixes
[List bug fixes]

## 🔧 Improvements
[List improvements]

## 📋 System Requirements
- macOS: macOS 10.15+
- Windows: Windows 10+
- Hollow Knight: Silksong: Steam installation
- BepInEx: Will be detected automatically

## 🐛 Known Issues
[List known issues]

## 🤝 Feedback
[How to report issues]
```

## 🎯 Next Steps After Release

1. **Monitor feedback** from users
2. **Fix critical bugs** reported
3. **Plan next version** features
4. **Update documentation** based on user feedback
5. **Consider stable release** when ready
