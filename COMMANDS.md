# OmniShelf — Platform Commands Reference

## Prerequisites

```bash
node --version   # ≥ 18.0
npm --version    # ≥ 9.0
java --version   # ≥ 17 (for Android APK)
# Android Studio installed with SDK 33+ (for APK)
# Xcode (macOS only, for iOS)
```

---

## 1. Initial Setup

```bash
# Clone / scaffold project
npm install

# Install Capacitor CLI globally (needed for APK)
npm install -g @capacitor/cli
```

---

## 2. Development

```bash
# Standard local dev server (localhost only)
npm run dev

# Open in browser at: http://localhost:5173
```

---

## 3. ═══ LOCAL NETWORK VERSION (LAN Share) ═══

```bash
# Launch app visible to ALL devices on your Wi-Fi
npm run share

# Output example:
# ╔══════════════════════════════════════════════════╗
# ║  Local:   http://localhost:5173                  ║
# ║  Network: http://192.168.1.42:5173               ║
# ╚══════════════════════════════════════════════════╝
#
# Open http://192.168.1.42:5173 on any phone/tablet on the same Wi-Fi

# Alternative: share the PRODUCTION build (faster)
npm run build && node scripts/share.js --preview
# or
npm run preview  # also runs on 0.0.0.0 (see vite.config.js)
```

---

## 4. Production Web Build

```bash
npm run build
# Output: dist/
# Deploy dist/ to any static host (Vercel, Netlify, nginx, etc.)

# Verify build locally
npm run preview
# → http://localhost:4173
```

---

## 5. ═══ ANDROID APK ═══

### First-time setup

```bash
# 1. Initialize Capacitor (run once)
npm run cap:init
# → Creates capacitor.config.ts (already provided)

# 2. Add Android platform
npx cap add android
# → Creates android/ directory

# 3. Copy your AndroidManifest.xml overrides
cp android/AndroidManifest.xml android/app/src/main/AndroidManifest.xml
```

### Build Debug APK

```bash
# Full pipeline: build web → sync → compile APK
npm run apk:debug

# APK location:
# android/app/build/outputs/apk/debug/app-debug.apk

# Install directly on connected device via USB
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Build Release APK (for distribution)

```bash
# 1. Generate a keystore (one-time)
keytool -genkey -v \
  -keystore release.keystore \
  -alias omnishelf \
  -keyalg RSA -keysize 2048 \
  -validity 10000

# 2. Set signing env variables
export KEYSTORE_PATH=release.keystore
export KEYSTORE_ALIAS=omnishelf
export KEYSTORE_PASS=your_password

# 3. Build signed release APK
npm run apk:release

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

### Open in Android Studio (for further editing)

```bash
npm run cap:android
# → Opens android/ in Android Studio
```

---

## 6. ═══ WINDOWS .EXE INSTALLER ═══

### Development (Electron live preview)

```bash
npm run electron:dev
# → Vite dev server + Electron window, hot-reload enabled
```

### Build Windows .EXE + Setup Installer

```bash
# Requires: running on Windows, OR Wine on Linux/macOS
npm run electron:build

# Outputs in release/:
# ├── OmniShelf Setup 2.0.0.exe     ← NSIS installer (recommended)
# ├── OmniShelf 2.0.0.exe           ← Portable (no install needed)
# └── win-unpacked/                 ← Raw unpacked app
```

### Build for other platforms

```bash
# macOS .dmg (must run on macOS)
npm run electron:mac
# Output: release/OmniShelf-2.0.0.dmg

# Linux AppImage + .deb
npm run electron:linux
# Output: release/OmniShelf-2.0.0.AppImage
#         release/omnishelf_2.0.0_amd64.deb
```

---

## 7. Complete Build Matrix

| Command                  | Output                                    | Platform       |
|--------------------------|-------------------------------------------|----------------|
| `npm run dev`            | Dev server localhost:5173                 | Web (dev)      |
| `npm run share`          | Dev server 0.0.0.0:5173 (LAN)            | Web (LAN)      |
| `npm run build`          | `dist/` static files                      | Web (prod)     |
| `npm run preview`        | Preview dist on 0.0.0.0:4173             | Web (preview)  |
| `npm run apk:debug`      | `app-debug.apk`                           | Android        |
| `npm run apk:release`    | `app-release.apk`                         | Android        |
| `npm run electron:build` | `OmniShelf Setup.exe` + portable `.exe`   | Windows        |
| `npm run electron:mac`   | `OmniShelf.dmg`                           | macOS          |
| `npm run electron:linux` | `.AppImage` + `.deb`                      | Linux          |

---

## 8. QA Checklist

```bash
# Run production build and check for breakages
npm run build 2>&1 | grep -E "error|warning|chunk"

# Check bundle sizes
ls -lh dist/assets/

# Test on narrow screen: Chrome DevTools → iPhone SE (375px wide)
# Verify: no horizontal overflow, sidebar drawer works, sort bar scrolls

# Memory leak test: in browser console
# 1. Open a CBZ comic → switch to Scroll mode → close reader
# 2. Open a DOCX → switch through all 4 modes → close reader
# 3. Repeat 20x rapidly
# 4. Check: chrome://memory-internals → OmniShelf tab should stay stable
```

---

## 9. Troubleshooting

```bash
# Port already in use
npm run share -- --port 5200

# Android build fails — clean Gradle cache
cd android && ./gradlew clean && cd ..

# Electron code-sign error on Windows (skip for dev)
CSC_IDENTITY_AUTO_DISCOVERY=false npm run electron:build

# PDF.js worker CORS issue in Electron
# Already handled in electron/main.js via webSecurity: false for dev only
```
