# macOS Installer (STAGED)

## Building DMG

1. Build Electron app: `cd launcher && npm run dist`
2. Use `electron-builder` macOS target
3. Notarize for distribution (requires Apple Developer account)

## Notarization Steps

```bash
# Sign the app
codesign --deep --force --verify --verbose --sign "Developer ID Application: Your Name" FORGE.app

# Create DMG
electron-builder --mac dmg

# Notarize
xcrun notarytool submit FORGE.dmg --keychain-profile "notary-profile" --wait

# Staple
xcrun stapler staple FORGE.dmg
```

Wire up after validation.
