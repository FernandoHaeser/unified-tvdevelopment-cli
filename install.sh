#!/usr/bin/env bash
# tvdev-cli — one-line installer (macOS / Linux)
#
#   curl -fsSL https://raw.githubusercontent.com/tvdev-cli/tvdev-cli/main/install.sh | bash
#   curl -fsSL https://raw.githubusercontent.com/tvdev-cli/tvdev-cli/main/install.sh | bash -s -- --beta
#
set -euo pipefail

REPO="tvdev-cli/tvdev-cli"
BIN="tvdev"
REQUIRED_NODE=18
NVM_VERSION="v0.39.7"
INSTALL_NODE_VERSION="20"
INSTALL_DIR="${HOME}/.local/bin"
VERSION_FILE="${INSTALL_DIR}/.tvdev-version"
CHANNEL="stable"

# ── Flags ─────────────────────────────────────────────────────────────────────
for arg in "${@:-}"; do
  case "$arg" in
    --beta)   CHANNEL="beta" ;;
    --stable) CHANNEL="stable" ;;
  esac
done

# ── Colors ────────────────────────────────────────────────────────────────────
if [ -t 1 ]; then
  INDIGO='\033[38;5;99m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
  RED='\033[0;31m'; BOLD='\033[1m'; DIM='\033[2m'; RESET='\033[0m'
else
  INDIGO=''; GREEN=''; YELLOW=''; RED=''; BOLD=''; DIM=''; RESET=''
fi

# ── Helpers ───────────────────────────────────────────────────────────────────
banner() {
  echo ""
  echo -e "${BOLD}${INDIGO}  ◉  TV Dev Manager${RESET}"
  echo -e "  ${INDIGO}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo -e "  ${DIM}Universal Smart TV Development CLI${RESET}"
  echo -e "  ${DIM}LG webOS · Samsung Tizen · Amazon Fire TV · Android TV${RESET}"
  [ "$CHANNEL" = "beta" ] && echo -e "  ${YELLOW}  channel: beta${RESET}"
  echo ""
}

step()  { echo -e "\n${BOLD}${INDIGO}  ▶  $*${RESET}"; }
ok()    { echo -e "  ${GREEN}✓${RESET}  $*"; }
info()  { echo -e "  ${INDIGO}●${RESET}  $*"; }
warn()  { echo -e "  ${YELLOW}⚠${RESET}  $*"; }
fail()  { echo -e "\n  ${RED}✗  $*${RESET}\n"; exit 1; }

semver_gte() {
  local a b
  a=$(echo "$1" | sed 's/-.*//')
  b=$(echo "$2" | sed 's/-.*//')
  [ "$(printf '%s\n%s\n' "$a" "$b" | sort -V | head -1)" = "$b" ]
}

detect_shell_rc() {
  case "${SHELL:-}" in
    */zsh)  echo "$HOME/.zshrc" ;;
    */bash) [ -f "$HOME/.bash_profile" ] && echo "$HOME/.bash_profile" || echo "$HOME/.bashrc" ;;
    */fish) echo "$HOME/.config/fish/config.fish" ;;
    *)      echo "$HOME/.profile" ;;
  esac
}

gh_api() {
  curl -fsSL \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "$1"
}

# ── Resolve latest release tag from GitHub ────────────────────────────────────
resolve_release_tag() {
  if [ "$CHANNEL" = "beta" ]; then
    gh_api "https://api.github.com/repos/${REPO}/releases" \
      | grep -E '"tag_name"|"prerelease"' \
      | paste - - \
      | awk -F'"' '$0 ~ /"prerelease": true/ { print $4; exit }'
  else
    gh_api "https://api.github.com/repos/${REPO}/releases/latest" \
      | grep '"tag_name"' \
      | sed 's/.*"tag_name": *"\([^"]*\)".*/\1/'
  fi
}

banner

# ── Resolve release ───────────────────────────────────────────────────────────
step "Resolving latest ${CHANNEL} release from GitHub"

RELEASE_TAG=$(resolve_release_tag)
[ -z "$RELEASE_TAG" ] && fail "Could not resolve release from GitHub. Visit https://github.com/${REPO}/releases"

RELEASE_VERSION="${RELEASE_TAG#v}"
info "Latest release : ${RELEASE_TAG}"

# ── Idempotency ───────────────────────────────────────────────────────────────
step "Checking existing installation"

INSTALLED_VER=""
if [ -f "$VERSION_FILE" ]; then
  INSTALLED_VER=$(cat "$VERSION_FILE" 2>/dev/null | tr -d '[:space:]v' || true)
fi

if [ -n "$INSTALLED_VER" ] && command -v "$BIN" &>/dev/null; then
  ok "${BIN} already installed"
  info "Installed : v${INSTALLED_VER}"
  info "Latest    : v${RELEASE_VERSION} (${CHANNEL})"

  if semver_gte "$INSTALLED_VER" "$RELEASE_VERSION"; then
    ok "Already up to date — nothing to do"
    echo ""
    echo -e "  ${BOLD}Run: ${INDIGO}${BIN}${RESET}"
    echo ""
    exit 0
  fi
  info "Update available — reinstalling"
else
  info "${BIN} not yet installed — starting fresh install"
fi

# ── Node.js ───────────────────────────────────────────────────────────────────
step "Checking Node.js"

install_node_via_nvm() {
  warn "Node.js not found — installing via nvm"
  export NVM_DIR="${HOME}/.nvm"
  curl -fsSL "https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VERSION}/install.sh" | bash
  [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
  nvm install "$INSTALL_NODE_VERSION"
  nvm use "$INSTALL_NODE_VERSION"
  nvm alias default "$INSTALL_NODE_VERSION"
  ok "Node.js $(node --version) installed via nvm"
}

if ! command -v node &>/dev/null; then
  NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    source "$NVM_DIR/nvm.sh"
    ! command -v node &>/dev/null && nvm install "$INSTALL_NODE_VERSION" && nvm use "$INSTALL_NODE_VERSION"
  else
    install_node_via_nvm
  fi
fi

! command -v node &>/dev/null && fail "Node.js install failed. Install manually: https://nodejs.org"

NODE_MAJOR=$(node --version | sed 's/v//' | cut -d. -f1)
[ "$NODE_MAJOR" -lt "$REQUIRED_NODE" ] && \
  fail "Node.js ${REQUIRED_NODE}+ required (got $(node --version)). Upgrade: https://nodejs.org"

ok "Node.js $(node --version)"

# Warn on odd (non-LTS) Node versions — some platform tools are unstable on them
if [ $((NODE_MAJOR % 2)) -ne 0 ]; then
  warn "Node.js $(node --version) is an odd/non-LTS release. Platform tools (ares-cli, sdb) may be unstable."
  warn "Recommended: Node 18, 20, or 22 LTS — switch with: nvm use --lts"
fi

# ── Download binary from GitHub release ───────────────────────────────────────
step "Downloading ${BIN} ${RELEASE_TAG}"

mkdir -p "$INSTALL_DIR"
BIN_PATH="${INSTALL_DIR}/${BIN}"
DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${RELEASE_TAG}/cli.mjs"

info "Source : ${DOWNLOAD_URL}"

if curl -fsSL --output "$BIN_PATH" "$DOWNLOAD_URL"; then
  chmod +x "$BIN_PATH"
  echo "$RELEASE_VERSION" > "$VERSION_FILE"
  ok "Installed to ${BIN_PATH}"
else
  warn "GitHub download failed — falling back to npm"
  command -v npm &>/dev/null || fail "npm not found and GitHub download failed. Install Node.js from https://nodejs.org"
  NPM_TAG="latest"
  [ "$CHANNEL" = "beta" ] && NPM_TAG="beta"
  npm install -g "unified-tvdevelopment-cli@${NPM_TAG}" 2>&1 | grep -v "^npm warn" | grep -v "^$" || true
  # point BIN_PATH to npm global bin for the version file
  BIN_PATH=$(npm prefix -g)/bin/${BIN}
  echo "$RELEASE_VERSION" > "$VERSION_FILE"
fi

# ── PATH ──────────────────────────────────────────────────────────────────────
step "Setting up PATH"

rc_file=$(detect_shell_rc)

if echo ":${PATH}:" | grep -q ":${INSTALL_DIR}:"; then
  ok "PATH already contains ${INSTALL_DIR}"
else
  if [[ "${SHELL:-}" == */fish ]]; then
    grep -qF "$INSTALL_DIR" "$rc_file" 2>/dev/null || \
      echo "set -gx PATH \$PATH ${INSTALL_DIR}" >> "$rc_file"
  else
    if ! grep -qF "$INSTALL_DIR" "$rc_file" 2>/dev/null; then
      echo "" >> "$rc_file"
      echo "# added by tvdev-cli installer" >> "$rc_file"
      echo "export PATH=\"\$PATH:${INSTALL_DIR}\"" >> "$rc_file"
    fi
  fi
  ok "Added ${INSTALL_DIR} to PATH in ${rc_file}"
  export PATH="${PATH}:${INSTALL_DIR}"
fi

hash -r 2>/dev/null || true

if command -v "$BIN" &>/dev/null; then
  ok "${BIN} is in PATH → $(command -v ${BIN})"
else
  warn "${BIN} not in PATH yet — restart terminal or run:"
  echo -e "\n    source $(detect_shell_rc)\n"
fi

# ── Platform tools ────────────────────────────────────────────────────────────
step "Checking and installing platform-specific tools"

install_ares_cli() {
  info "Installing ares-cli via npm..."
  # If nvm is active, install under the LTS alias so it's available regardless of active version
  if command -v nvm &>/dev/null 2>&1 || [ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]; then
    [ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ] && source "${NVM_DIR:-$HOME/.nvm}/nvm.sh"
    # Install under current nvm version and also alias for cross-version availability
    npm install -g @webosose/ares-cli 2>&1 | grep -v "^npm warn" | grep -v "^$" || true
    ok "ares-cli installed under Node $(node --version)"
    info "Note: with nvm, npm globals are per Node version. Switch versions with: nvm use <version>"
  else
    if npm install -g @webosose/ares-cli 2>&1 | grep -v "^npm warn" | grep -v "^$"; then
      ok "ares-cli (LG webOS) installed → $(command -v ares-setup-device 2>/dev/null || echo 'reload shell')"
    else
      warn "ares-cli install failed — run manually: npm install -g @webosose/ares-cli"
    fi
  fi
}

install_adb() {
  if [[ "$(uname)" == "Darwin" ]]; then
    if command -v brew &>/dev/null; then
      info "Installing adb via Homebrew..."
      if brew install --quiet android-platform-tools; then
        ok "adb (Fire TV/Android TV) installed → $(command -v adb)"
      else
        warn "Homebrew adb install failed — install Android Studio SDK manually"
      fi
    else
      warn "adb not found — install Homebrew first, then: brew install android-platform-tools"
    fi
  else
    # Linux
    if command -v apt-get &>/dev/null; then
      info "Installing adb via apt..."
      if sudo apt-get install -y -qq adb 2>/dev/null; then
        ok "adb (Fire TV/Android TV) installed → $(command -v adb)"
      else
        warn "apt adb install failed — install Android SDK Platform Tools manually"
      fi
    elif command -v dnf &>/dev/null; then
      info "Installing adb via dnf..."
      if sudo dnf install -y -q android-tools 2>/dev/null; then
        ok "adb (Fire TV/Android TV) installed → $(command -v adb)"
      else
        warn "dnf adb install failed — install Android SDK Platform Tools manually"
      fi
    else
      warn "adb not found — install Android SDK Platform Tools: https://developer.android.com/studio/releases/platform-tools"
    fi
  fi
}

# ares-cli (LG webOS) — auto-install via npm
if command -v ares-setup-device &>/dev/null; then
  ok "ares-cli  (LG webOS) → $(command -v ares-setup-device)"
else
  warn "ares-cli (LG webOS) not found — installing..."
  install_ares_cli
fi

# sdb (Samsung Tizen) — requires Tizen Studio GUI installer, warn only
if command -v sdb &>/dev/null; then
  ok "sdb       (Samsung Tizen) → $(command -v sdb)"
else
  warn "sdb (Samsung Tizen) not found — requires Tizen Studio: https://developer.samsung.com/smarttv"
fi

# adb (Fire TV / Android TV) — auto-install
if command -v adb &>/dev/null; then
  ok "adb       (Fire TV/Android TV) → $(command -v adb)"
else
  warn "adb (Fire TV/Android TV) not found — installing..."
  install_adb
fi

# inputd-cli — not available on npm; skip silently
if command -v inputd-cli &>/dev/null; then
  ok "inputd-cli (Fire TV input) → $(command -v inputd-cli)"
else
  info "inputd-cli (Fire TV input) — optional, not on npm. Install manually if needed."
fi

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${INDIGO}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${BOLD}${GREEN}  ✓  Installation complete! (${RELEASE_TAG})${RESET}"
echo ""
echo -e "  Launch TV Dev Manager:  ${BOLD}${INDIGO}${BIN}${RESET}"
echo ""
echo -e "  ${DIM}GitHub : https://github.com/tvdev-cli/tvdev-cli${RESET}"
echo -e "  ${DIM}npm    : https://npmjs.com/package/unified-tvdevelopment-cli${RESET}"
echo ""
rc_tip=$(detect_shell_rc)
if ! echo ":${PATH}:" | grep -q ":${INSTALL_DIR}:"; then
  echo -e "  ${YELLOW}Tip:${RESET} to make ${BOLD}${INDIGO}${BIN}${RESET} available in every new terminal, add this to ${rc_tip}:"
  echo ""
  echo -e "    ${DIM}export PATH=\"\$PATH:${INSTALL_DIR}\"${RESET}"
  echo ""
  echo -e "  Then reload: ${DIM}source ${rc_tip}${RESET}"
  echo ""
fi
