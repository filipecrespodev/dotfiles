#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../scripts/utils.sh"

info "Iniciando instalação de pacotes do sistema..."

# Atualiza repositórios
update_system() {
    info "Atualizando repositórios do sistema..."

    if is_linux; then
        if command_exists apt-get; then
            sudo apt-get update -y
            sudo apt-get upgrade -y
        elif command_exists dnf; then
            sudo dnf update -y
        elif command_exists pacman; then
            sudo pacman -Syu --noconfirm
        fi
    elif is_macos; then
        if ! command_exists brew; then
            info "Instalando Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        brew update
    fi

    success "Sistema atualizado"
}

# Pacotes essenciais
install_essentials() {
    info "Instalando pacotes essenciais..."

    local packages=(
        git
        curl
        wget
        zsh
        vim
        tmux
        build-essential
        ca-certificates
    )

    if is_linux && command_exists apt-get; then
        sudo apt-get install -y "${packages[@]}"
    elif is_macos; then
        brew install "${packages[@]}"
    fi

    success "Pacotes essenciais instalados"
}

# Ferramentas de desenvolvimento
install_dev_tools() {
    info "Instalando ferramentas de desenvolvimento..."

    local packages=(
        ripgrep
        fzf
        xclip
        silversearcher-ag
    )

    if is_linux && command_exists apt-get; then
        # Adiciona pacotes específicos do Linux
        packages+=(
            bison
            pkg-config
            ncurses-dev
            libevent-dev
            software-properties-common
            gnupg2
            apt-transport-https
        )
        sudo apt-get install -y "${packages[@]}"
    elif is_macos; then
        # No macOS, alguns pacotes têm nomes diferentes
        brew install ripgrep fzf the_silver_searcher
    fi

    success "Ferramentas de desenvolvimento instaladas"
}

# Fontes
install_fonts() {
    info "Instalando dependências de fontes..."

    if is_linux && command_exists apt-get; then
        # Apenas instala as ferramentas necessárias para gerenciar fontes
        sudo apt-get install -y fontconfig unzip
    elif is_macos; then
        # No macOS, fontconfig geralmente já vem instalado
        if ! command_exists unzip; then
            brew install unzip
        fi
    fi

    # Chama o script específico de instalação de fontes
    if [[ -f "${SCRIPT_DIR}/fonts.sh" ]]; then
        bash "${SCRIPT_DIR}/fonts.sh"
    else
        warning "Script de fontes não encontrado. Execute 'install/fonts.sh' manualmente."
    fi

    success "Processo de instalação de fontes concluído"
}

# Emuladores de Terminal
install_terminal_emulator() {
    if ! ask_yes_no "Deseja instalar um emulador de terminal moderno?" "y"; then
        return
    fi

    echo ""
    echo "Escolha o emulador de terminal:"
    echo ""
    echo "  1) Alacritty (Recomendado)"
    echo "     - Mais rápido (GPU-accelerated)"
    echo "     - Leve e minimalista"
    echo "     - Configuração simples em YAML"
    echo ""
    echo "  2) Kitty"
    echo "     - GPU-accelerated"
    echo "     - Suporta imagens no terminal"
    echo "     - Split panes nativo"
    echo ""
    echo "  3) Ambos"
    echo ""
    read -p "Opção [1-3] (padrão: 1): " choice
    choice=${choice:-1}

    if is_linux && command_exists apt-get; then
        case $choice in
            1)
                info "Instalando Alacritty..."
                # Tenta instalar via repositórios oficiais primeiro
                if sudo apt-get install -y alacritty 2>/dev/null; then
                    success "Alacritty instalado via apt"
                else
                    # Se falhar, usa cargo (Rust)
                    warning "Instalando via cargo (pode levar alguns minutos)..."
                    if ! command_exists cargo; then
                        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
                        source "$HOME/.cargo/env"
                    fi
                    cargo install alacritty
                    success "Alacritty instalado via cargo"
                fi
                ;;
            2)
                info "Instalando Kitty..."
                sudo apt-get install -y kitty
                success "Kitty instalado"
                ;;
            3)
                info "Instalando Alacritty e Kitty..."
                # Alacritty
                if sudo apt-get install -y alacritty 2>/dev/null; then
                    success "Alacritty instalado via apt"
                else
                    warning "Instalando Alacritty via cargo (pode levar alguns minutos)..."
                    if ! command_exists cargo; then
                        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
                        source "$HOME/.cargo/env"
                    fi
                    cargo install alacritty
                    success "Alacritty instalado via cargo"
                fi
                # Kitty
                sudo apt-get install -y kitty
                success "Alacritty e Kitty instalados"
                ;;
        esac
    elif is_macos; then
        case $choice in
            1)
                brew install --cask alacritty
                success "Alacritty instalado"
                ;;
            2)
                brew install --cask kitty
                success "Kitty instalado"
                ;;
            3)
                brew install --cask alacritty kitty
                success "Alacritty e Kitty instalados"
                ;;
        esac
    fi

    # Configura terminal como padrão
    echo ""
    if ask_yes_no "Deseja configurar o terminal instalado como padrão do sistema?" "y"; then
        if [[ -f "${SCRIPT_DIR}/../scripts/set-default-terminal.sh" ]]; then
            bash "${SCRIPT_DIR}/../scripts/set-default-terminal.sh"
        else
            warning "Script de configuração de terminal padrão não encontrado."
        fi
    fi
}

# Aplicativos opcionais
install_optional_apps() {
    if ! ask_yes_no "Deseja instalar aplicativos opcionais (Brave, etc)?" "n"; then
        return
    fi

    info "Instalando aplicativos opcionais..."

    if is_linux && command_exists apt-get; then
        # Brave Browser
        if ! command_exists brave-browser; then
            sudo curl -fsSLo /usr/share/keyrings/brave-browser-archive-keyring.gpg \
                https://brave-browser-apt-release.s3.brave.com/brave-browser-archive-keyring.gpg
            echo "deb [signed-by=/usr/share/keyrings/brave-browser-archive-keyring.gpg] https://brave-browser-apt-release.s3.brave.com/ stable main" | \
                sudo tee /etc/apt/sources.list.d/brave-browser-release.list
            sudo apt-get update
            sudo apt-get install -y brave-browser
        fi

        # Outras ferramentas úteis
        sudo apt-get install -y peek dconf-cli chrome-gnome-shell flameshot

    elif is_macos; then
        brew install --cask brave-browser
    fi

    success "Aplicativos opcionais instalados"
}

# Flameshot (Screenshot tool)
install_flameshot() {
    if ! ask_yes_no "Deseja instalar Flameshot (ferramenta de screenshot)?" "y"; then
        return
    fi

    info "Instalando Flameshot..."

    if is_linux && command_exists apt-get; then
        sudo apt-get install -y flameshot
    elif is_macos; then
        brew install --cask flameshot
    fi

    if command_exists flameshot; then
        success "Flameshot instalado"

        # Configura atalho automático se possível
        if [[ -f "${SCRIPT_DIR}/../scripts/configure-flameshot.sh" ]]; then
            if ask_yes_no "Deseja configurar o atalho Print Screen para o Flameshot?" "y"; then
                bash "${SCRIPT_DIR}/../scripts/configure-flameshot.sh"
            fi
        fi
    else
        error "Falha ao instalar Flameshot"
    fi
}

# LibreOffice
install_libreoffice() {
    if command_exists libreoffice; then
        info "LibreOffice já está instalado"
        return
    fi

    if ! ask_yes_no "Deseja instalar LibreOffice?" "y"; then
        return
    fi

    info "Instalando LibreOffice..."

    if is_linux && command_exists apt-get; then
        sudo apt-get install -y libreoffice libreoffice-l10n-pt-br libreoffice-help-pt-br
        success "LibreOffice instalado com suporte ao português"
    elif is_macos; then
        brew install --cask libreoffice
        success "LibreOffice instalado via Homebrew"
    fi
}

# Snap packages (apenas Linux)
install_snap_packages() {
    if ! is_linux || ! command_exists snap; then
        return
    fi

    if ! ask_yes_no "Deseja instalar pacotes snap (Telegram, Spotify, etc)?" "n"; then
        return
    fi

    info "Instalando pacotes snap..."

    local snap_packages=(
        "telegram-desktop"
        "spotify"
    )

    for package in "${snap_packages[@]}"; do
        if ! snap list | grep -q "$package"; then
            sudo snap install "$package"
        fi
    done

    success "Pacotes snap instalados"
}

main() {
    update_system
    install_essentials
    install_dev_tools
    install_fonts
    install_terminal_emulator
    install_flameshot
    install_libreoffice
    install_optional_apps
    install_snap_packages

    success "Instalação de pacotes concluída!"
}

# Executa apenas se for chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
