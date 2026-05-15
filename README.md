# TV Dev Manager

> Universal TUI for Smart TV development — LG webOS · Samsung Tizen · Amazon Fire TV · Android TV

A single terminal interface to manage devices, build, package, deploy, inspect logs, transfer files, and run shell commands across all major Smart TV platforms.

---

## Requirements

- **Node.js** ≥ 18
- Platform CLI tools installed and on `PATH`:

| Platform | Required Tools |
|---|---|
| LG webOS | [`ares-cli`](https://webostv.developer.lge.com/develop/tools/cli-introduction) |
| Samsung Tizen | [`tizen`](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/installing-tv-sdk.html) + `sdb` |
| Amazon Fire TV | `adb` + [`inputd-cli`](https://developer.amazon.com/docs/fire-tv/remote-input.html) |
| Android TV | `adb` + `gradle` / Android SDK |

---

## Install

**One-liner (macOS / Linux):**

```bash
curl -fsSL https://raw.githubusercontent.com/FernandoHaeser/unified-tvdevelopment-cli/main/install.sh | bash
```

**Beta channel:**

```bash
curl -fsSL https://raw.githubusercontent.com/FernandoHaeser/unified-tvdevelopment-cli/main/install.sh | bash -s -- --beta
```

**Windows (PowerShell):**

```powershell
irm https://raw.githubusercontent.com/FernandoHaeser/unified-tvdevelopment-cli/main/install.ps1 | iex
```

**Via npm:**

```bash
npm install -g unified-tvdevelopment-cli
```

---

## Usage

```bash
tvdev
```

On launch, select your target platform. The TUI opens with a sidebar listing all available screens for that platform.

---

## Navigation

| Key | Action |
|---|---|
| `↑` / `↓` | Move cursor |
| `Enter` | Select / confirm |
| `Esc` | Back / return to sidebar |
| `p` | Switch platform (from sidebar) |
| `q` | Quit |

> All screens are keyboard-driven. No mouse required.

---

## Screens

### Dashboard
Overview of connected devices and installed apps. Quick-action shortcuts `[1]`–`[6]` jump directly to any screen, or use `↑↓` + `Enter`.

---

### Devices

Manage TV devices / emulator connections.

| Platform | Actions |
|---|---|
| **webOS** | Add device (name, host, SSH port, username, password) · Remove · Set default · Refresh |
| **Tizen** | Connect via SDB (host, port) · Disconnect · Refresh |
| **Fire TV** | Connect via ADB (host, port) · Disconnect · Set active · Refresh |
| **Android TV** | Connect via ADB (host, port) · Disconnect · Set active · Refresh |

Keys: `[a]` add/connect · `[d]` remove/disconnect · `[s]` set default (webOS) · `[r]` refresh · `Enter` set active (ADB platforms)

---

### Generate App _(webOS, Tizen)_

Scaffold a new app from official templates.

1. Pick a template (`↑↓` + `Enter`)
2. Fill in the form fields (`Tab` / `Enter` to advance, `Esc` to go back)
3. App is generated in the specified output directory

---

### Package & Deploy / Install APK

Build, package, and install an app to a connected device.

**webOS / Tizen:** Enter source directory → auto-packages to `.ipk` / `.wgt` → confirm install → optionally launch.

**Fire TV / Android TV:** Enter APK path → confirm install → optionally launch.

Keys: `Enter` advance · `[y]` / `[n]` confirm prompts · `[r]` restart

---

### Build _(Android TV, Tizen)_

Run Gradle or Tizen build tasks directly from the TUI.

| Platform | Tasks |
|---|---|
| **Android TV** | Debug Build · Release Build · Run Tests · Clean |
| **Tizen** | Build Web App · Package → .wgt |

Select task → enter project directory → `Enter` to build.

---

### App Manager

List, launch, stop, and uninstall apps on the connected device.

| Symbol | Meaning |
|---|---|
| `▶ RUN` | App is running |
| `■ STOP` | App is stopped |

Keys: `↑↓` navigate · `Enter` / `[l]` launch or stop · `[d]` uninstall · `[r]` refresh

---

### Log Viewer

Live log stream from the connected device (tail-follows output).

Keys: `[p]` pause/resume · `[c]` clear · `[r]` restart stream

Color-coded output: errors in red, warnings in yellow.

---

### File Transfer

Push files to or pull files from the device.

1. `[p]` push (host → device) or `[l]` pull (device → host)
2. Enter source path → `Enter`
3. Enter destination path → `Enter` to transfer

---

### Shell

Run arbitrary shell commands on the connected device.

- Type command and press `Enter`
- `↑` / `↓` navigate command history
- `Ctrl+C` clear output

---

### Inspector _(webOS)_

Launch `ares-inspect` for a selected app. Opens the Web Inspector URL for debugging in a browser.

For other platforms, shows step-by-step debug setup instructions (Chrome DevTools, ADB forwarding, etc.).

---

### Input Simulator _(Amazon Fire TV)_

Send remote control key events to a Fire TV device via `inputd-cli`.

- `↑↓` select key group · `→` / `Enter` enter key list
- `↑↓` select key · `Enter` send
- `←` / `Esc` back to groups

Groups: Navigation · System · Media · Volume · Numbers

---

### Emulator _(Tizen, Android TV)_

List and launch AVDs / Tizen emulators.

Keys: `↑↓` select · `Enter` launch · `[r]` refresh

---

## Platform Screen Matrix

| Screen | webOS | Tizen | Fire TV | Android TV |
|---|:---:|:---:|:---:|:---:|
| Dashboard | ✓ | ✓ | ✓ | ✓ |
| Devices | ✓ | ✓ | ✓ | ✓ |
| Generate App | ✓ | ✓ | | |
| Package & Deploy | ✓ | ✓ | ✓ | ✓ |
| Build | | ✓ | | ✓ |
| App Manager | ✓ | ✓ | ✓ | ✓ |
| Log Viewer | ✓ | ✓ | ✓ | ✓ |
| File Transfer | ✓ | ✓ | ✓ | ✓ |
| Shell | ✓ | ✓ | ✓ | ✓ |
| Web Inspector | ✓ | | ✓* | ✓* |
| Input Simulator | | | ✓ | |
| Emulator | | ✓ | | ✓ |

_* Inspector screen shows platform debug setup guide_

---

## Development

```bash
# Clone
git clone https://github.com/FernandoHaeser/unified-tvdevelopment-cli
cd unified-tvdevelopment-cli

# Install dependencies
npm install

# Build and run
npm run dev

# Build only
npm run build

# Tests
npm test
npm run test:unit
npm run test:integration
npm run test:coverage
```

Built with [Ink](https://github.com/vadimdemedes/ink) (React for CLIs) + [esbuild](https://esbuild.github.io/).

---

## License

MIT
