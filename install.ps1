# unified-tvdevelopment-cli — Windows installer
# Run:
#   iwr -useb https://raw.githubusercontent.com/FernandoHaeser/unified-tvdevelopment-cli/main/install.ps1 | iex
#   iwr -useb https://raw.githubusercontent.com/FernandoHaeser/unified-tvdevelopment-cli/main/install.ps1 | iex  # then pass -Beta

param(
  [switch]$Beta,
  [string]$Tag = "latest"
)

$ErrorActionPreference = 'Stop'
$Package = "unified-tvdevelopment-cli"
$Bin     = "tvdev"
$RequiredNodeMajor = 18

if ($Beta) { $Tag = "beta" }

# ── Helpers ───────────────────────────────────────────────────────────────────
function Write-Banner {
  Write-Host ""
  Write-Host "  [TV Dev Manager]" -ForegroundColor Cyan -NoNewline
  if ($Tag -ne "latest") {
    Write-Host "  tag: $Tag" -ForegroundColor Yellow
  } else {
    Write-Host ""
  }
  Write-Host "  Universal Smart TV Development CLI" -ForegroundColor DarkGray
  Write-Host "  LG webOS · Samsung Tizen · Amazon Fire TV · Android TV" -ForegroundColor DarkGray
  Write-Host ""
}

function Write-Step { param($msg) Write-Host "`n  > $msg" -ForegroundColor Cyan }
function Write-Ok   { param($msg) Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Info { param($msg) Write-Host "  [..] $msg" -ForegroundColor Blue }
function Write-Warn { param($msg) Write-Host "  [!!] $msg" -ForegroundColor Yellow }
function Write-Fail { param($msg) Write-Host "`n  [XX] $msg`n" -ForegroundColor Red; exit 1 }

function Get-SemverParts {
  param([string]$v)
  $core = ($v -split '-')[0]
  return ($core -split '\.' | ForEach-Object { [int]$_ })
}

function Compare-Version {
  param([string]$installed, [string]$latest)
  $a = Get-SemverParts $installed
  $b = Get-SemverParts $latest
  for ($i = 0; $i -lt [Math]::Max($a.Count, $b.Count); $i++) {
    $av = if ($i -lt $a.Count) { $a[$i] } else { 0 }
    $bv = if ($i -lt $b.Count) { $b[$i] } else { 0 }
    if ($av -gt $bv) { return 1 }
    if ($av -lt $bv) { return -1 }
  }
  return 0
}

Write-Banner

# ── Idempotency ───────────────────────────────────────────────────────────────
Write-Step "Checking existing installation"

$installedVer = ""
$latestVer    = ""

if (Get-Command $Bin -ErrorAction SilentlyContinue) {
  try {
    $installedVer = (npm list -g --depth=0 $Package 2>$null | Select-String $Package) `
      -replace ".*@", "" | ForEach-Object { $_.Trim() }
    $latestVer = (npm show "${Package}@${Tag}" version 2>$null).Trim()
  } catch {}

  Write-Ok "$Bin already installed"
  if ($installedVer) { Write-Info "Installed : $installedVer" }
  if ($latestVer)    { Write-Info "Latest    : $latestVer ($Tag)" }

  if ($installedVer -and $latestVer -and (Compare-Version $installedVer $latestVer) -ge 0) {
    Write-Ok "Already up to date — nothing to do"
    Write-Host "`n  Run: $Bin`n" -ForegroundColor Cyan
    exit 0
  }

  Write-Info "Update available — reinstalling"
} else {
  Write-Info "$Bin not yet installed — starting fresh install"
}

# ── Node.js ───────────────────────────────────────────────────────────────────
Write-Step "Checking Node.js"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Warn "Node.js not found."
  Write-Host "  Install from https://nodejs.org (LTS recommended)" -ForegroundColor DarkGray
  Write-Host "  Or via winget: winget install OpenJS.NodeJS.LTS" -ForegroundColor DarkGray
  Write-Fail "Node.js $RequiredNodeMajor+ required."
}

$nodeVer   = (node --version).TrimStart('v')
$nodeMajor = [int]($nodeVer -split '\.')[0]

if ($nodeMajor -lt $RequiredNodeMajor) {
  Write-Fail "Node.js $RequiredNodeMajor+ required (got v$nodeVer). Upgrade: https://nodejs.org"
}

Write-Ok "Node.js v$nodeVer"

# ── npm ───────────────────────────────────────────────────────────────────────
Write-Step "Checking npm"

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Fail "npm not found. Reinstall Node.js from https://nodejs.org"
}

Write-Ok "npm $(npm --version)"

# ── Install ───────────────────────────────────────────────────────────────────
Write-Step "Installing ${Package}@${Tag}"
Write-Info "Running: npm install -g ${Package}@${Tag}"
Write-Host ""

npm install -g "${Package}@${Tag}" 2>&1 | Where-Object { $_ -notmatch "^npm warn" -and $_.Trim() -ne "" }

Write-Host ""
Write-Ok "$Package installed"

# ── Verify ────────────────────────────────────────────────────────────────────
Write-Step "Verifying"

try {
  $binPath = (Get-Command $Bin -ErrorAction Stop).Path
  Write-Ok "$Bin → $binPath"
} catch {
  Write-Warn "$Bin not found in PATH. Restart your terminal and try again."
}

# ── Platform tools ────────────────────────────────────────────────────────────
Write-Step "Checking platform-specific tools"

if (Get-Command "ares-setup-device" -ErrorAction SilentlyContinue) {
  Write-Ok "ares-cli (LG webOS) found"
} else {
  Write-Warn "ares-cli not found → npm install -g @webosose/ares-cli"
}

if (Get-Command "sdb" -ErrorAction SilentlyContinue) {
  Write-Ok "sdb (Samsung Tizen) found"
} else {
  Write-Warn "sdb not found → install Tizen Studio: developer.samsung.com/smarttv"
}

if (Get-Command "adb" -ErrorAction SilentlyContinue) {
  Write-Ok "adb (Fire TV / Android TV) found"
} else {
  Write-Warn "adb not found → install Android SDK Platform Tools"
}

if (Get-Command "inputd-cli" -ErrorAction SilentlyContinue) {
  Write-Ok "inputd-cli (Fire TV input) found"
} else {
  Write-Warn "inputd-cli not found (optional — Fire TV remote input simulation)"
}

# ── Done ──────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "  Launch TV Dev Manager: " -NoNewline
Write-Host $Bin -ForegroundColor Cyan
Write-Host ""
Write-Host "  GitHub : https://github.com/FernandoHaeser/unified-tvdevelopment-cli" -ForegroundColor DarkGray
Write-Host "  npm    : https://npmjs.com/package/unified-tvdevelopment-cli" -ForegroundColor DarkGray
Write-Host ""
