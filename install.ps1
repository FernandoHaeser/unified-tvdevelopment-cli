# tvdev-cli — Windows installer
# Run:
#   iwr -useb https://raw.githubusercontent.com/tvdev-cli/tvdev-cli/main/install.ps1 | iex
#   iwr -useb https://raw.githubusercontent.com/tvdev-cli/tvdev-cli/main/install.ps1 | iex -Beta
#
param(
  [switch]$Beta
)

$ErrorActionPreference = 'Stop'

$Repo             = "tvdev-cli/tvdev-cli"
$Bin              = "tvdev"
$Channel          = if ($Beta) { "beta" } else { "stable" }
$RequiredNodeMajor = 18
$InstallDir       = Join-Path $env:LOCALAPPDATA "tvdev\bin"
$BinPath          = Join-Path $InstallDir "$Bin"
$VersionFile      = Join-Path $InstallDir ".tvdev-version"

# ── Helpers ───────────────────────────────────────────────────────────────────
function Write-Banner {
  Write-Host ""
  Write-Host "  [TV Dev Manager]" -ForegroundColor Cyan -NoNewline
  if ($Channel -eq "beta") { Write-Host "  channel: beta" -ForegroundColor Yellow } else { Write-Host "" }
  Write-Host "  Universal Smart TV Development CLI" -ForegroundColor DarkGray
  Write-Host "  LG webOS · Samsung Tizen · Amazon Fire TV · Android TV" -ForegroundColor DarkGray
  Write-Host ""
}

function Write-Step { param($msg) Write-Host "`n  > $msg" -ForegroundColor Cyan }
function Write-Ok   { param($msg) Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Info { param($msg) Write-Host "  [..] $msg" -ForegroundColor Blue }
function Write-Warn { param($msg) Write-Host "  [!!] $msg" -ForegroundColor Yellow }
function Write-Fail { param($msg) Write-Host "`n  [XX] $msg`n" -ForegroundColor Red; exit 1 }

function Invoke-GhApi {
  param([string]$Url)
  $headers = @{
    'Accept'               = 'application/vnd.github+json'
    'X-GitHub-Api-Version' = '2022-11-28'
    'User-Agent'           = 'tvdev-cli-installer'
  }
  Invoke-RestMethod -Uri $Url -Headers $headers
}

function Compare-Semver {
  param([string]$A, [string]$B)
  # returns $true if A >= B (strip pre-release suffix)
  $av = [Version](($A -split '-')[0] -replace '^v','')
  $bv = [Version](($B -split '-')[0] -replace '^v','')
  return $av -ge $bv
}

function Add-ToUserPath {
  param([string]$Dir)
  $current = [Environment]::GetEnvironmentVariable("PATH", "User")
  if ($current -split ';' -contains $Dir) { return $false }
  [Environment]::SetEnvironmentVariable("PATH", "$current;$Dir", "User")
  $env:PATH = "$env:PATH;$Dir"
  return $true
}

function Test-Command {
  param([string]$Name)
  return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

Write-Banner

# ── Resolve latest release from GitHub ───────────────────────────────────────
Write-Step "Resolving latest $Channel release from GitHub"

try {
  if ($Channel -eq "beta") {
    $releases = Invoke-GhApi "https://api.github.com/repos/$Repo/releases"
    $release  = $releases | Where-Object { $_.prerelease -eq $true } | Select-Object -First 1
  } else {
    $release = Invoke-GhApi "https://api.github.com/repos/$Repo/releases/latest"
  }

  if (-not $release -or -not $release.tag_name) {
    Write-Fail "Could not resolve release from GitHub. Visit https://github.com/$Repo/releases"
  }

  $ReleaseTag     = $release.tag_name
  $ReleaseVersion = $ReleaseTag -replace '^v', ''
} catch {
  Write-Fail "GitHub API request failed: $_"
}

Write-Info "Latest release : $ReleaseTag"

# ── Idempotency check ─────────────────────────────────────────────────────────
Write-Step "Checking existing installation"

$InstalledVer = ""
if (Test-Path $VersionFile) {
  $InstalledVer = (Get-Content $VersionFile -Raw).Trim().TrimStart('v')
}

if ($InstalledVer -and (Test-Path $BinPath)) {
  Write-Ok "$Bin already installed"
  Write-Info "Installed : v$InstalledVer"
  Write-Info "Latest    : v$ReleaseVersion ($Channel)"

  if (Compare-Semver $InstalledVer $ReleaseVersion) {
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

if (-not (Test-Command "node")) {
  Write-Warn "Node.js not found — attempting install via winget"
  try {
    winget install --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements --silent
    # reload PATH for current session
    $env:PATH = [Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" +
                [Environment]::GetEnvironmentVariable("PATH", "User")
    Write-Ok "Node.js installed via winget"
  } catch {
    Write-Host "  Install Node.js manually from https://nodejs.org (LTS recommended)" -ForegroundColor DarkGray
    Write-Host "  Or via winget: winget install OpenJS.NodeJS.LTS" -ForegroundColor DarkGray
    Write-Fail "Node.js $RequiredNodeMajor+ required."
  }
}

if (-not (Test-Command "node")) {
  Write-Fail "Node.js not found after install. Restart terminal and re-run this script."
}

$nodeVer   = (node --version).TrimStart('v')
$nodeMajor = [int]($nodeVer -split '\.')[0]

if ($nodeMajor -lt $RequiredNodeMajor) {
  Write-Fail "Node.js $RequiredNodeMajor+ required (got v$nodeVer). Upgrade: https://nodejs.org"
}

Write-Ok "Node.js v$nodeVer"

# Warn on odd (non-LTS) Node versions
if ($nodeMajor % 2 -ne 0) {
  Write-Warn "Node.js v$nodeVer is an odd/non-LTS release. Platform tools (ares-cli, sdb) may be unstable."
  Write-Warn "Recommended: Node 18, 20, or 22 LTS — download from https://nodejs.org"
}

# ── Download binary from GitHub release ───────────────────────────────────────
Write-Step "Downloading $Bin $ReleaseTag"

New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

# Find the cli.mjs asset in the release
$asset = $release.assets | Where-Object { $_.name -eq "cli.mjs" } | Select-Object -First 1

if ($asset) {
  $DownloadUrl = $asset.browser_download_url
} else {
  $DownloadUrl = "https://github.com/$Repo/releases/download/$ReleaseTag/cli.mjs"
}

Write-Info "Source : $DownloadUrl"

$downloaded = $false
try {
  Invoke-WebRequest -Uri $DownloadUrl -OutFile $BinPath -UseBasicParsing
  $downloaded = $true
  Write-Ok "Binary downloaded to $BinPath"
} catch {
  Write-Warn "GitHub download failed — falling back to npm"
}

if (-not $downloaded) {
  if (-not (Test-Command "npm")) {
    Write-Fail "npm not found and GitHub download failed. Install Node.js from https://nodejs.org"
  }
  $NpmTag = if ($Channel -eq "beta") { "beta" } else { "latest" }
  Write-Info "Running: npm install -g unified-tvdevelopment-cli@$NpmTag"
  npm install -g "unified-tvdevelopment-cli@$NpmTag" 2>&1 | Where-Object { $_ -notmatch "^npm warn" -and $_.Trim() -ne "" }
  # use npm global bin path
  $BinPath = Join-Path (npm prefix -g) "bin\$Bin"
}

# Create a wrapper .cmd so Windows can execute the .mjs without typing 'node'
$WrapperPath = Join-Path $InstallDir "$Bin.cmd"
$WrapperContent = "@echo off`r`nnode `"%~dp0$Bin`" %*"
Set-Content -Path $WrapperPath -Value $WrapperContent -Encoding ASCII

# Save installed version
Set-Content -Path $VersionFile -Value $ReleaseVersion -Encoding UTF8
Write-Ok "Installed to $InstallDir"

# ── PATH ──────────────────────────────────────────────────────────────────────
Write-Step "Setting up PATH"

if (Add-ToUserPath $InstallDir) {
  Write-Ok "Added $InstallDir to user PATH"
  Write-Warn "Restart your terminal for PATH to take effect in new sessions"
} else {
  Write-Ok "PATH already contains $InstallDir"
}

if (Test-Command $Bin) {
  Write-Ok "$Bin is available in PATH"
} else {
  Write-Warn "$Bin not in PATH for this session — restart terminal to use it"
}

# ── Platform tools ────────────────────────────────────────────────────────────
Write-Step "Checking and installing platform-specific tools"

function Install-NpmPackage {
  param([string]$Package, [string]$Label)
  Write-Info "Installing $Label via npm..."
  try {
    npm install -g $Package 2>&1 | Where-Object { $_ -notmatch "^npm warn" -and $_.Trim() -ne "" }
    Write-Ok "$Label installed"
  } catch {
    Write-Warn "$Label install failed — run manually: npm install -g $Package"
  }
}

function Install-AdbViaWinget {
  Write-Info "Installing adb via winget (Android Platform Tools)..."
  try {
    winget install --id Google.PlatformTools --accept-source-agreements --accept-package-agreements --silent
    $env:PATH = [Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" +
                [Environment]::GetEnvironmentVariable("PATH", "User")
    Write-Ok "adb (Fire TV/Android TV) installed"
  } catch {
    Write-Warn "winget adb install failed — install Android SDK Platform Tools: https://developer.android.com/studio/releases/platform-tools"
  }
}

# ares-cli (LG webOS) — auto-install via npm
if (Test-Command "ares-setup-device") {
  Write-Ok "ares-cli  (LG webOS) — found"
} else {
  Write-Warn "ares-cli (LG webOS) not found — installing..."
  Install-NpmPackage "@webosose/ares-cli" "ares-cli"
}

# sdb (Samsung Tizen) — requires Tizen Studio GUI installer, warn only
if (Test-Command "sdb") {
  Write-Ok "sdb       (Samsung Tizen) — found"
} else {
  Write-Warn "sdb (Samsung Tizen) not found — requires Tizen Studio: https://developer.samsung.com/smarttv"
}

# adb (Fire TV / Android TV) — auto-install via winget
if (Test-Command "adb") {
  Write-Ok "adb       (Fire TV/Android TV) — found"
} else {
  Write-Warn "adb (Fire TV/Android TV) not found — installing..."
  Install-AdbViaWinget
}

# inputd-cli — not available on npm; skip silently
if (Test-Command "inputd-cli") {
  Write-Ok "inputd-cli (Fire TV input) — found"
} else {
  Write-Info "inputd-cli (Fire TV input) — optional, not on npm. Install manually if needed."
}

# ── Done ──────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  Installation complete! ($ReleaseTag)" -ForegroundColor Green
Write-Host ""
Write-Host "  Launch TV Dev Manager: " -NoNewline
Write-Host $Bin -ForegroundColor Cyan
Write-Host ""
Write-Host "  GitHub : https://github.com/tvdev-cli/tvdev-cli" -ForegroundColor DarkGray
Write-Host "  npm    : https://npmjs.com/package/unified-tvdevelopment-cli" -ForegroundColor DarkGray
Write-Host ""

$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if (-not ($currentPath -split ';' -contains $InstallDir)) {
  Write-Host "  Tip: to make " -NoNewline -ForegroundColor Yellow
  Write-Host "$Bin" -NoNewline -ForegroundColor Cyan
  Write-Host " available in every new terminal, add this to your user PATH:" -ForegroundColor Yellow
  Write-Host ""
  Write-Host "    [Environment]::SetEnvironmentVariable('PATH', `$env:PATH + ';$InstallDir', 'User')" -ForegroundColor DarkGray
  Write-Host ""
  Write-Host "  Or restart your terminal — the installer already added it." -ForegroundColor DarkGray
  Write-Host ""
}
