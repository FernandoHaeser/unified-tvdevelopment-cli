#!/usr/bin/env bash
# unified-tvdevelopment-cli — one-line installer
# Supports: LG webOS, Samsung Tizen, Amazon Fire TV, Android TV
#
#   curl -fsSL https://raw.githubusercontent.com/FernandoHaeser/unified-tvdevelopment-cli/main/install.sh | bash
#   curl -fsSL https://raw.githubusercontent.com/FernandoHaeser/unified-tvdevelopment-cli/main/install.sh | bash -s -- --beta
#
set -euo pipefail

PACKAGE="unified-tvdevelopment-cli"
BIN="tvdev"
REQUIRED_NODE=18
NVM_VERSION="v0.39.7"
INSTALL_NODE_VERSION="20"
NPM_TAG="latest"

# ── Flags ─────────────────────────────────────────────────────────────────────
for arg in "${@:-}"; do
  case "$arg" in
    --beta)           NPM_TAG="beta" ;;
    --tag=*)          NPM_TAG="${arg#--tag=}" ;;
    --tag)            shift; NPM_TAG="${1:-latest}" ;;
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
  if [ "$NPM_TAG" != "latest" ]; then
    echo -e "  ${YELLOW}  tag: ${NPM_TAG}${RESET}"
  fi
  echo ""
}

step()  { echo -e "\n${BOLD}${INDIGO}  ▶  $*${RESET}"; }
ok()    { echo -e "  ${GREEN}✓${RESET}  $*"; }
info()  { echo -e "  ${INDIGO}●${RESET}  $*"; }
warn()  { echo -e "  ${YELLOW}⚠${RESET}  $*"; }
fail()  { echo -e "\n  ${RED}✗  $*${RESET}\n"; exit 1; }

# ── Semver compare (returns 0 if $1 >= $2) ────────────────────────────────────
semver_gte() {
  # strip pre-release suffix for comparison
  local a b
  a=$(echo "$1" | sed 's/-.*//')
  b=$(echo "$2" | sed 's/-//')
  [ "$(printf '%s\n%s\n' "$a" "$b" | sort -V | head -1)" = "$b" ]
}

detect_shell_rc() {
  case "${SHELL:-}" in
    */zsh)  echo "$HOME/.zshrc"  ;;
    */bash)
      [ -f "$HOME/.bash_profile" ] && echo "$HOME/.bash_profile" || echo "$HOME/.bashrc"
      ;;
    */fish) echo "$HOME/.config/fish/config.fish" ;;
    *)      echo "$HOME/.profile" ;;
  esac
}

idempotent_path_export() {
  local bin_dir rc_file export_line
  bin_dir=$(npm prefix -g 2>/dev/null)/bin
  rc_file=$(detect_shell_rc)

  if echo ":${PATH}:" | grep -q ":${bin_dir}:"; then
    ok "PATH already contains npm global bin"
    return
  fi

  if [[ "${SHELL:-}" == */fish ]]; then
    export_line="set -gx PATH \$PATH ${bin_dir}"
  else
    export_line="export PATH=\"\$PATH:${bin_dir}\""
  fi

  if [ -f "$rc_file" ] && grep -qF "$bin_dir" "$rc_file" 2>/dev/null; then
    ok "PATH entry already in ${rc_file}"
    return
  fi

  echo "" >> "$rc_file"
  echo "# added by unified-tvdevelopment-cli installer" >> "$rc_file"
  echo "$export_line" >> "$rc_file"
  ok "Added PATH entry to ${rc_file}"
  export PATH="${PATH}:${bin_dir}"
}

# ── Idempotency check ─────────────────────────────────────────────────────────
banner

step "Checking existing installation"

INSTALLED_VER=""
LATEST_VER=""

if command -v "$BIN" &>/dev/null; then
  INSTALLED_VER=$(npm list -g --depth=0 "$PACKAGE" 2>/dev/null \
    | grep "$PACKAGE" | sed 's/.*@//' | tr -d '[:space:]' || true)
  LATEST_VER=$(npm show "${PACKAGE}@${NPM_TAG}" version 2>/dev/null || true)

  ok "${BIN} already installed"
  [ -n "$INSTALLED_VER" ] && info "Installed : ${INSTALLED_VER}"
  [ -n "$LATEST_VER"    ] && info "Latest    : ${LATEST_VER} (${NPM_TAG})"

  if [ -n "$INSTALLED_VER" ] && [ -n "$LATEST_VER" ] && semver_gte "$INSTALLED_VER" "$LATEST_VER"; then
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

# ── npm ───────────────────────────────────────────────────────────────────────
step "Checking npm"
! command -v npm &>/dev/null && fail "npm not found."
ok "npm $(npm --version)"

# ── Install ───────────────────────────────────────────────────────────────────
step "Installing ${PACKAGE}@${NPM_TAG}"
info "Running: npm install -g ${PACKAGE}@${NPM_TAG}"
echo ""
npm install -g "${PACKAGE}@${NPM_TAG}" 2>&1 | grep -v "^npm warn" | grep -v "^$" || true
echo ""
ok "${PACKAGE} installed"

# ── PATH ──────────────────────────────────────────────────────────────────────
step "Setting up PATH"
idempotent_path_export
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
  warn "adb not found → brew install android-platform-tools  (or Android Studio SDK)"
fi

if command -v inputd-cli &>/dev/null; then
  ok "inputd-cli (Fire TV input) → $(command -v inputd-cli)"
else
  warn "inputd-cli not found (optional — Fire TV remote input simulation)"
fi

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${INDIGO}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${BOLD}${GREEN}  ✓  Installation complete!${RESET}"
echo ""
echo -e "  Launch TV Dev Manager:  ${BOLD}${INDIGO}${BIN}${RESET}"
echo ""
echo -e "  ${DIM}GitHub : https://github.com/FernandoHaeser/unified-tvdevelopment-cli${RESET}"
echo -e "  ${DIM}npm    : https://npmjs.com/package/unified-tvdevelopment-cli${RESET}"
echo ""
