# macOS Gatekeeper Guide - Silk Spool

## 🚨 Problem

When users download the DMG from GitHub, macOS shows the error:

> "Silk Spool" is damaged and cannot be opened. You should move it to the Trash.

This happens because:

1. The app is not **notarized** by Apple (requires paid Developer account)
2. macOS Gatekeeper blocks non-notarized apps downloaded from the internet
3. Even though the app is **signed** with a development certificate, it's not sufficient for distribution

## 🔧 Implemented Solutions

### 1. Automatic App Bundle Signing

**Modified file**: `silk-spool/src-tauri/tauri.conf.json`

```json
{
  "bundle": {
    "macOS": {
      "signingIdentity": "Apple Development: francescograzioso1995@gmail.com (DG5SNSM874)"
    }
  }
}
```

**Result**: Tauri automatically signs the app bundle during build.

### 2. Updated Build Script

**Modified file**: `build-release.sh`

- Added automatic app bundle signing after build
- Removed DMG signing (not needed if app is signed)
- Added logging for the signing process

### 3. Release Notes with Instructions

**Updated file**: GitHub Release v0.3.0

Added detailed instructions for users on how to bypass Gatekeeper.

## 📋 Instructions for Users

### Method 1: Right-click and Open (Recommended)

1. Download the DMG from GitHub
2. **Right-click** on the DMG (NOT double-click)
3. Select **"Open"** from the context menu
4. Click **"Open"** when macOS asks for confirmation
5. Drag the app to your Applications folder

### Method 2: System Preferences

1. Try to open the DMG normally
2. Go to **System Preferences** > **Security & Privacy**
3. Click **"Open Anyway"** next to the blocked app message
4. Try opening the DMG again

### Method 3: Terminal (Advanced)

```bash
# Removes the quarantine attribute from the DMG
sudo xattr -rd com.apple.quarantine /path/to/SilkSpool.dmg
```

## 🔍 Signature Verification

### Check if the app is signed:

```bash
codesign --verify --deep --strict --verbose=2 "/path/to/Silk Spool.app"
```

### Check if Gatekeeper accepts the DMG:

```bash
spctl --assess --verbose "/path/to/SilkSpool.dmg"
```

## 🛠️ Build Process

### Local Build with Signing:

```bash
cd silk-spool
npm run tauri build
```

### Complete Build Script:

```bash
./build-release.sh
```

### Create DMG Manually (if needed):

```bash
hdiutil create -volname "Silk Spool" \
  -srcfolder "./silk-spool/src-tauri/target/release/bundle/macos/Silk Spool.app" \
  -ov -format UDZO "./SilkSpool.dmg"
```

## 📝 Technical Notes

### Development Certificates

- **Current certificate**: `Apple Development: francescograzioso1995@gmail.com (DG5SNSM874)`
- **Type**: Development certificate (free)
- **Limitation**: Cannot notarize apps for distribution

### Apple Notarization

- **Cost**: $99/year for Apple Developer account
- **Process**: Requires sending the app to Apple for verification
- **Result**: App automatically accepted by Gatekeeper

### Future Alternatives

1. **App Store**: Distribution via Mac App Store (requires Developer account)
2. **Notarization**: Apple notarization process
3. **User Instructions**: Maintain current instructions (current solution)

## 🚀 Future Updates

### For Future Versions:

1. Keep automatic signing in `tauri.conf.json`
2. Update release notes with Gatekeeper instructions
3. Consider notarization if the project becomes commercial

### Files to Update:

- `silk-spool/src-tauri/tauri.conf.json` (certificate)
- `build-release.sh` (build process)
- GitHub Release Notes (user instructions)

## 📚 References

- [Apple Code Signing Guide](https://developer.apple.com/library/archive/documentation/Security/Conceptual/CodeSigningGuide/)
- [Tauri macOS Configuration](https://tauri.app/v1/guides/building/macos/)
- [Gatekeeper User Guide](https://support.apple.com/en-us/HT202491)

---

**Last updated**: September 24, 2025  
**Version**: v0.3.0  
**Status**: Implemented and documented
