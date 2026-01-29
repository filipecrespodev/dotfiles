#!/bin/bash

# ══════════════════════════════════════════════════════════════
# FUNÇÕES DE INSTALAÇÃO - PACOTES DO SISTEMA
# ══════════════════════════════════════════════════════════════

# Este arquivo é sourced pelo bootstrap.sh
# As funções install_* são chamadas diretamente

SCRIPT_DIR="${SCRIPT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
[[ -z "$NC" ]] && source "${SCRIPT_DIR}/../scripts/utils.sh"

# ══════════════════════════════════════════════════════════════
# CATEGORIA: SISTEMA BASE
# ══════════════════════════════════════════════════════════════

install_homebrew() {
    if command_exists brew; then
        return 0
    fi

    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    # Configura PATH para Homebrew no Linux
    if is_linux; then
        local brew_path="/home/linuxbrew/.linuxbrew/bin/brew"
        if [[ -f "$brew_path" ]]; then
            eval "$($brew_path shellenv)"
            local shellenv_cmd='eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"'
            if [[ -f "$HOME/.zshrc" ]] && ! grep -q "linuxbrew" "$HOME/.zshrc"; then
                echo "$shellenv_cmd" >> "$HOME/.zshrc"
            fi
        fi
    fi
    return 0
}

install_essentials() {
    local packages=(git curl wget zsh vim tmux)

    if is_linux && command_exists apt-get; then
        sudo apt-get update -y
        sudo apt-get install -y build-essential ca-certificates "${packages[@]}"
    elif is_macos && command_exists brew; then
        brew install "${packages[@]}"
    fi
    return 0
}

install_dev_dependencies() {
    if is_linux && command_exists apt-get; then
        sudo apt-get install -y \
            bison pkg-config ncurses-dev libevent-dev \
            software-properties-common gnupg2 apt-transport-https
    fi
    return 0
}

category_base() {
    local items=(
        "Homebrew|Gerenciador de pacotes universal"
        "Essenciais|git, curl, wget, zsh, vim, tmux"
        "Dependências Dev|build-essential, pkg-config, etc"
    )

    show_selection_menu "SISTEMA BASE - Selecione os componentes" "${items[@]}"

    for num in $MENU_SELECTION; do
        case $num in
            1) run_installation "Homebrew" install_homebrew brew ;;
            2) run_installation "Pacotes Essenciais" install_essentials zsh ;;
            3) run_installation "Dependências Dev" install_dev_dependencies ;;
        esac
    done
}

# ══════════════════════════════════════════════════════════════
# CATEGORIA: FONTES
# ══════════════════════════════════════════════════════════════

install_jetbrains_mono() {
    local font_dir
    if is_macos; then
        font_dir="$HOME/Library/Fonts"
    else
        font_dir="$HOME/.local/share/fonts"
    fi

    if fc-list 2>/dev/null | grep -qi "JetBrains"; then
        return 0
    fi

    mkdir -p "$font_dir"

    local version="3.0"
    local zip_file="/tmp/JetBrainsMono.zip"
    curl -fsSL "https://github.com/JetBrains/JetBrainsMono/releases/download/v${version}/JetBrainsMono-${version}.zip" -o "$zip_file"
    unzip -o "$zip_file" -d "/tmp/JetBrainsMono"
    cp /tmp/JetBrainsMono/fonts/ttf/*.ttf "$font_dir/"
    rm -rf /tmp/JetBrainsMono "$zip_file"

    if is_linux && command_exists fc-cache; then
        fc-cache -fv "$font_dir" >/dev/null 2>&1
    fi
    return 0
}

install_meslo_nf() {
    local font_dir
    if is_macos; then
        font_dir="$HOME/Library/Fonts"
    else
        font_dir="$HOME/.local/share/fonts"
    fi

    if fc-list 2>/dev/null | grep -qi "MesloLGS NF"; then
        return 0
    fi

    mkdir -p "$font_dir"

    local base_url="https://github.com/romkatv/powerlevel10k-media/raw/master"
    local fonts=(
        "MesloLGS%20NF%20Regular.ttf"
        "MesloLGS%20NF%20Bold.ttf"
        "MesloLGS%20NF%20Italic.ttf"
        "MesloLGS%20NF%20Bold%20Italic.ttf"
    )

    for font in "${fonts[@]}"; do
        local font_name
        font_name=$(echo "$font" | sed 's/%20/ /g')
        curl -fsSL "$base_url/$font" -o "$font_dir/$font_name"
    done

    if is_linux && command_exists fc-cache; then
        fc-cache -fv "$font_dir" >/dev/null 2>&1
    fi
    return 0
}

category_fonts() {
    local items=(
        "JetBrains Mono|Fonte moderna para programação"
        "MesloLGS NF|Nerd Font para Powerlevel10k"
    )

    show_selection_menu "FONTES - Selecione as fontes" "${items[@]}"

    for num in $MENU_SELECTION; do
        case $num in
            1) run_installation "JetBrains Mono" install_jetbrains_mono ;;
            2) run_installation "MesloLGS NF" install_meslo_nf ;;
        esac
    done
}

# ══════════════════════════════════════════════════════════════
# CATEGORIA: TERMINAIS
# ══════════════════════════════════════════════════════════════

install_alacritty() {
    if is_linux && command_exists apt-get; then
        if ! sudo apt-get install -y alacritty 2>/dev/null; then
            # Fallback: instala via cargo
            if ! command_exists cargo; then
                curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
                source "$HOME/.cargo/env"
            fi
            cargo install alacritty
        fi
    elif is_macos; then
        brew install --cask alacritty
    fi
    return 0
}

install_kitty() {
    if is_linux && command_exists apt-get; then
        sudo apt-get install -y kitty
    elif is_macos; then
        brew install --cask kitty
    fi
    return 0
}

install_terminator() {
    if is_linux && command_exists apt-get; then
        sudo apt-get install -y terminator
    fi
    return 0
}

category_terminals() {
    local items=(
        "Alacritty|Terminal GPU-accelerated, rápido e leve"
        "Kitty|Terminal GPU com suporte a imagens"
        "Terminator|Terminal com split panes nativo"
    )

    show_selection_menu "TERMINAIS - Selecione os terminais" "${items[@]}"

    for num in $MENU_SELECTION; do
        case $num in
            1) run_installation "Alacritty" install_alacritty alacritty ;;
            2) run_installation "Kitty" install_kitty kitty ;;
            3) run_installation "Terminator" install_terminator terminator ;;
        esac
    done
}

# ══════════════════════════════════════════════════════════════
# CATEGORIA: APLICATIVOS
# ══════════════════════════════════════════════════════════════

install_brave() {
    if is_linux && command_exists apt-get; then
        sudo curl -fsSLo /usr/share/keyrings/brave-browser-archive-keyring.gpg \
            https://brave-browser-apt-release.s3.brave.com/brave-browser-archive-keyring.gpg
        echo "deb [signed-by=/usr/share/keyrings/brave-browser-archive-keyring.gpg] https://brave-browser-apt-release.s3.brave.com/ stable main" | \
            sudo tee /etc/apt/sources.list.d/brave-browser-release.list
        sudo apt-get update
        sudo apt-get install -y brave-browser
    elif is_macos; then
        brew install --cask brave-browser
    fi
    return 0
}

install_discord() {
    if is_linux; then
        if command_exists snap; then
            sudo snap install discord
        elif command_exists apt-get; then
            local discord_deb="/tmp/discord.deb"
            wget -O "$discord_deb" "https://discord.com/api/download?platform=linux&format=deb"
            sudo apt-get install -y "$discord_deb"
            rm -f "$discord_deb"
        fi
    elif is_macos; then
        brew install --cask discord
    fi
    return 0
}

install_spotify() {
    if is_linux && command_exists snap; then
        sudo snap install spotify
    elif is_macos; then
        brew install --cask spotify
    fi
    return 0
}

install_telegram() {
    if is_linux && command_exists snap; then
        sudo snap install telegram-desktop
    elif is_macos; then
        brew install --cask telegram
    fi
    return 0
}

install_libreoffice() {
    if is_linux && command_exists apt-get; then
        sudo apt-get install -y libreoffice libreoffice-l10n-pt-br libreoffice-help-pt-br
    elif is_macos; then
        brew install --cask libreoffice
    fi
    return 0
}

install_flameshot() {
    if is_linux && command_exists apt-get; then
        sudo apt-get install -y flameshot
    elif is_macos; then
        brew install --cask flameshot
    fi
    return 0
}

category_apps() {
    local items=(
        "Brave Browser|Navegador focado em privacidade"
        "Discord|Comunicação para comunidades"
        "Spotify|Streaming de música"
        "Telegram|Mensagens instantâneas"
        "LibreOffice|Suite de escritório"
        "Flameshot|Ferramenta de screenshots"
    )

    show_selection_menu "APLICATIVOS - Selecione os aplicativos" "${items[@]}"

    for num in $MENU_SELECTION; do
        case $num in
            1) run_installation "Brave Browser" install_brave brave-browser ;;
            2) run_installation "Discord" install_discord discord ;;
            3) run_installation "Spotify" install_spotify spotify ;;
            4) run_installation "Telegram" install_telegram telegram-desktop ;;
            5) run_installation "LibreOffice" install_libreoffice libreoffice ;;
            6) run_installation "Flameshot" install_flameshot flameshot ;;
        esac
    done
}

# ══════════════════════════════════════════════════════════════
# CATEGORIA: MONITORAMENTO
# ══════════════════════════════════════════════════════════════

install_btop() {
    if command_exists brew; then
        brew install btop
    elif is_linux && command_exists apt-get; then
        sudo apt-get install -y btop
    fi
    return 0
}

category_monitoring() {
    local items=(
        "btop|Monitor de sistema moderno e bonito"
    )

    show_selection_menu "MONITORAMENTO - Selecione as ferramentas" "${items[@]}"

    for num in $MENU_SELECTION; do
        case $num in
            1) run_installation "btop" install_btop btop ;;
        esac
    done
}

# ══════════════════════════════════════════════════════════════
# EXPORTS (funções disponíveis para o bootstrap.sh)
# ══════════════════════════════════════════════════════════════

# As funções install_* são chamadas diretamente pelo bootstrap.sh
