#!/usr/bin/env bash
# tvdev-cli — one-line installer
# Pulls the latest release binary directly from GitHub Releases.
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
CHANNEL="stable"   # stable | beta

# ── Flags ─────────────────────────────────────────────────────────────────────
for arg in "${@:-}"; do
  case "$arg" in
    --beta) CHANNEL="beta" ;;
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
  if [ "$CHANNEL" = "beta" ]; then
    echo -e "  ${YELLOW}  channel: beta${RESET}"
  fi
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
    */bash)
      [ -f "$HOME/.bash_profile" ] && echo "$HOME/.bash_profile" || echo "$HOME/.bashrc" ;;
    */fish) echo "$HOME/.config/fish/config.fish" ;;
    *)      echo "$HOME/.profile" ;;
  esac
}

# ── Resolve GitHub release ────────────────────────────────────────────────────
fetch_release_info() {
  local url
  if [ "$CHANNEL" = "beta" ]; then
    # latest pre-release (first entry that has prerelease:true)
    url="https://api.github.com/repos/${REPO}/releases"
    curl -fsSL "$url" \
      | grep -E '"tag_name"|"prerelease"' \
      | paste - - \
      | awk -F'"' '/"prerelease": true/{print $4; exit}'
  else
    # latest stable release
    curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" \
      | grep '"tag_name"' \
      | sed 's/.*"tag_name": *"\([^"]*\)".*/\1/'
  fi
}

# ── Banner ────────────────────────────────────────────────────────────────────
banner

# ── Resolve release tag ───────────────────────────────────────────────────────
step "Resolving latest ${CHANNEL} release from GitHub"

RELEASE_TAG=$(fetch_release_info)
[ -z "$RELEASE_TAG" ] && fail "Could not resolve release tag from GitHub. Check https://github.com/${REPO}/releases"

RELEASE_VERSION="${RELEASE_TAG#v}"
info "Release  : ${RELEASE_TAG}"

# Download URL for the cli.mjs asset attached to the release
DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${RELEASE_TAG}/cli.mjs"

# ── Idempotency check ─────────────────────────────────────────────────────────
step "Checking existing installation"

INSTALLED_VER=""
if command -v "$BIN" &>/dev/null; then
  INSTALLED_VER=$("$BIN" --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+[^ ]*' | head -1 || true)
  ok "${BIN} already installed"
  [ -n "$INSTALLED_VER" ] && info "Installed : ${INSTALLED_VER}"
  info "Latest    : ${RELEASE_VERSION} (${CHANNEL})"

  if [ -n "$INSTALLED_VER" ] && semver_gte "$INSTALLED_VER" "$RELEASE_VERSION"; then
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
    if ! command -v node &>/dev/null; then
      nvm install "$INSTALL_NODE_VERSION" && nvm use "$INSTALL_NODE_VERSION"
    fi
  else
    install_node_via_nvm
  fi
fi

! command -v node &>/dev/null && fail "Node.js install failed. Install manually: https://nodejs.org"

NODE_MAJOR=$(node --version | sed 's/v//' | cut -d. -f1)
[ "$NODE_MAJOR" -lt "$REQUIRED_NODE" ] && \
  fail "Node.js ${REQUIRED_NODE}+ required (got $(node --version)). Upgrade: https://nodejs.org"

ok "Node.js $(node --version)"

# ── Download & install binary from GitHub Release ────────────────────────────
step "Downloading ${BIN} ${RELEASE_TAG} from GitHub"
info "Source: ${DOWNLOAD_URL}"

INSTALL_DIR="${HOME}/.local/bin"
mkdir -p "$INSTALL_DIR"
BIN_PATH="${INSTALL_DIR}/${BIN}"

if curl -fsSL --output "$BIN_PATH" "$DOWNLOAD_URL"; then
  chmod +x "$BIN_PATH"
  ok "Installed to ${BIN_PATH}"
else
  # fallback: try npm if GitHub download fails
  warn "GitHub download failed — falling back to npm"
  ! command -v npm &>/dev/null && fail "npm not found. Install Node.js from https://nodejs.org"
  NPM_TAG="latest"
  [ "$CHANNEL" = "beta" ] && NPM_TAG="beta"
  npm install -g "unified-tvdevelopment-cli@${NPM_TAG}" 2>&1 | grep -v "^npm warn" | grep -v "^$" || true
fi

# ── PATH ──────────────────────────────────────────────────────────────────────
step "Setting up PATH"

rc_file=$(detect_shell_rc)
export_line="export PATH=\"\$PATH:${INSTALL_DIR}\""

if echo ":${PATH}:" | grep -q ":${INSTALL_DIR}:"; then
  ok "PATH already contains ${INSTALL_DIR}"
elif [[ "${SHELL:-}" == */fish ]]; then
  echo "set -gx PATH \$PATH ${INSTALL_DIR}" >> "$rc_file"
  ok "Added PATH entry to ${rc_file}"
else
  if ! grep -qF "$INSTALL_DIR" "$rc_file" 2>/dev/null; then
    echo "" >> "$rc_file"
    echo "# added by tvdev-cli installer" >> "$rc_file"
    echo "$export_line" >> "$rc_file"
    ok "Added PATH entry to ${rc_file}"
  else
    ok "PATH entry already in ${rc_file}"
  fi
  export PATH="${PATH}:${INSTALL_DIR}"
fi

hash -r 2>/dev/null || true

if command -v "$BIN" &>/dev/null; then
  ok "${BIN} is in PATH → $(command -v ${BIN})"
else
  warn "${BIN} not in PATH for this session. Restart terminal or:"
  echo -e "\n    source $(detect_shell_rc)\n"
fi

# ── Platform tools ────────────────────────────────────────────────────────────
step "Checking platform-specific tools"

if command -v ares-setup-device &>/dev/null; then
  ok "ares-cli (LG webOS) → $(command -v ares-setup-device)"
else
  warn "ares-cli not found → npm install -g @webosose/ares-cli"
fi

if command -v sdb &>/dev/null; then
  ok "sdb (Samsung Tizen) → $(command -v sdb)"
else
  warn "sdb not found → install Tizen Studio: developer.samsung.com/smarttv"
fi

if command -v adb &>/dev/null; then
  ok "adb (Fire TV / Android TV) → $(command -v adb)"
else
  warn "adb not found → brew install android-platform-tools"
fi

if command -v inputd-cli &>/dev/null; then
  ok "inputd-cli (Fire TV input) → $(command -v inputd-cli)"
else
  warn "inputd-cli not found (optional — Fire TV remote input simulation)"
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
