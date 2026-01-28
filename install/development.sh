#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../scripts/utils.sh"

info "Instalando ferramentas de desenvolvimento..."

# Homebrew - Gerenciador de pacotes
install_homebrew() {
    if command_exists brew; then
        info "Homebrew já está instalado"
        return
    fi

    if ! ask_yes_no "Deseja instalar Homebrew (gerenciador de pacotes)?" "y"; then
        return
    fi

    info "Instalando Homebrew..."

    # Instala dependências necessárias para o Homebrew no Linux
    if is_linux && command_exists apt-get; then
        sudo apt-get update
        sudo apt-get install -y build-essential procps curl file git
    elif is_linux && command_exists dnf; then
        sudo dnf groupinstall -y 'Development Tools'
        sudo dnf install -y procps-ng curl file git
    elif is_linux && command_exists pacman; then
        sudo pacman -S --noconfirm base-devel procps-ng curl file git
    fi

    # Instala Homebrew
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    # Configura o PATH para o Homebrew no Linux
    if is_linux; then
        local brew_path="/home/linuxbrew/.linuxbrew/bin/brew"
        if [[ -f "$brew_path" ]]; then
            eval "$($brew_path shellenv)"

            # Adiciona ao .bashrc e .zshrc se não estiver presente
            local shellenv_cmd='eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"'

            if [[ -f "$HOME/.bashrc" ]] && ! grep -q "linuxbrew" "$HOME/.bashrc"; then
                echo "$shellenv_cmd" >> "$HOME/.bashrc"
            fi

            if [[ -f "$HOME/.zshrc" ]] && ! grep -q "linuxbrew" "$HOME/.zshrc"; then
                echo "$shellenv_cmd" >> "$HOME/.zshrc"
            fi
        fi
    fi

    success "Homebrew instalado"
    info "Reinicie o terminal ou execute: eval \"\$(brew shellenv)\""
}

# Escolhe o theme engine
choose_zsh_theme_engine() {
    if [[ -d "$HOME/.oh-my-zsh" ]]; then
        info "Oh-My-Zsh já está instalado"
        echo "omz"
        return 0
    fi

    if command_exists oh-my-posh; then
        info "Oh-My-Posh já está instalado"
        echo "omp"
        return 0
    fi

    echo ""
    echo "Escolha o theme engine para ZSH:"
    echo ""
    echo "  1) Oh-My-Zsh + Powerlevel10k (Recomendado)"
    echo "     - Mais popular e estável"
    echo "     - Muitos plugins disponíveis"
    echo "     - Tema Powerlevel10k altamente customizável"
    echo ""
    echo "  2) Oh-My-Posh"
    echo "     - Mais moderno e rápido"
    echo "     - Temas compatíveis com Windows/macOS/Linux"
    echo "     - Configuração em JSON"
    echo ""
    read -p "Opção [1-2] (padrão: 1): " choice
    choice=${choice:-1}

    case $choice in
        1) echo "omz" ;;
        2) echo "omp" ;;
        *) echo "omz" ;;
    esac
}

# Oh-My-Zsh + Powerlevel10k
install_oh_my_zsh_stack() {
    info "Instalando Oh-My-Zsh + Powerlevel10k..."

    # Oh-My-Zsh
    if [[ ! -d "$HOME/.oh-my-zsh" ]]; then
        info "Instalando Oh-My-Zsh..."
        sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
        success "Oh-My-Zsh instalado"
    fi

    # Powerlevel10k
    local p10k_dir="${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k"
    if [[ ! -d "$p10k_dir" ]]; then
        info "Instalando Powerlevel10k..."
        git clone --depth=1 https://github.com/romkatv/powerlevel10k.git "$p10k_dir"
        success "Powerlevel10k instalado"
    fi

    # ZSH plugins
    info "Instalando plugins do ZSH..."
    local custom_plugins="${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins"

    # zsh-syntax-highlighting (destaca comandos válidos/inválidos)
    if [[ ! -d "$custom_plugins/zsh-syntax-highlighting" ]]; then
        git clone --depth=1 https://github.com/zsh-users/zsh-syntax-highlighting.git \
            "$custom_plugins/zsh-syntax-highlighting"
    fi

    # zsh-autosuggestions (sugestões baseadas no histórico)
    if [[ ! -d "$custom_plugins/zsh-autosuggestions" ]]; then
        git clone --depth=1 https://github.com/zsh-users/zsh-autosuggestions.git \
            "$custom_plugins/zsh-autosuggestions"
    fi

    # zsh-completions (completions extras para vários comandos)
    if [[ ! -d "$custom_plugins/zsh-completions" ]]; then
        git clone --depth=1 https://github.com/zsh-users/zsh-completions.git \
            "$custom_plugins/zsh-completions"
    fi

    success "Oh-My-Zsh stack instalado com sucesso!"
}

# Oh-My-Posh
install_oh_my_posh_stack() {
    info "Instalando Oh-My-Posh..."

    if command_exists oh-my-posh; then
        info "Oh-My-Posh já está instalado"
        return
    fi

    if is_linux; then
        curl -s https://ohmyposh.dev/install.sh | bash -s
    elif is_macos; then
        brew install jandedobbeleer/oh-my-posh/oh-my-posh
    fi

    # Instala plugins standalone do ZSH (sem Oh-My-Zsh)
    info "Instalando plugins do ZSH (standalone)..."

    mkdir -p "$HOME/.zsh"

    # zsh-syntax-highlighting
    if [[ ! -d "$HOME/.zsh/zsh-syntax-highlighting" ]]; then
        git clone --depth=1 https://github.com/zsh-users/zsh-syntax-highlighting.git \
            "$HOME/.zsh/zsh-syntax-highlighting"
    fi

    # zsh-autosuggestions
    if [[ ! -d "$HOME/.zsh/zsh-autosuggestions" ]]; then
        git clone --depth=1 https://github.com/zsh-users/zsh-autosuggestions.git \
            "$HOME/.zsh/zsh-autosuggestions"
    fi

    # zsh-completions
    if [[ ! -d "$HOME/.zsh/zsh-completions" ]]; then
        git clone --depth=1 https://github.com/zsh-users/zsh-completions.git \
            "$HOME/.zsh/zsh-completions"
        # Adiciona ao fpath para standalone
        echo 'fpath=(~/.zsh/zsh-completions/src $fpath)' >> "$HOME/.zshrc.local" 2>/dev/null || true
    fi

    success "Oh-My-Posh stack instalado com sucesso!"
}

# FZF - Fuzzy finder
install_fzf() {
    if command_exists fzf || [[ -d "$HOME/.fzf" ]]; then
        info "FZF já está instalado"
        return
    fi

    info "Instalando FZF..."

    if command_exists brew; then
        brew install fzf
        # Instala keybindings e completion
        "$(brew --prefix)/opt/fzf/install" --all --no-bash --no-fish
        success "FZF instalado via Homebrew"
    else
        git clone --depth 1 https://github.com/junegunn/fzf.git "$HOME/.fzf"
        "$HOME/.fzf/install" --all --no-bash --no-fish
        success "FZF instalado"
    fi
}

# ASDF - Version manager
install_asdf() {
    if command_exists asdf || [[ -d "$HOME/.asdf" ]]; then
        info "ASDF já está instalado"
        return
    fi

    info "Instalando ASDF..."

    if command_exists brew; then
        brew install asdf
        success "ASDF instalado via Homebrew"
    else
        git clone https://github.com/asdf-vm/asdf.git "$HOME/.asdf" --branch v0.14.0
        success "ASDF instalado"
    fi

    info "Configure os plugins do ASDF conforme necessário:"
    info "  asdf plugin add nodejs"
    info "  asdf plugin add python"
    info "  asdf plugin add golang"
}

# Python - Múltiplas versões via ASDF
install_python_versions() {
    if [[ ! -d "$HOME/.asdf" ]]; then
        warning "ASDF não está instalado. Instale o ASDF primeiro."
        return
    fi

    # Source ASDF para poder usar os comandos
    source "$HOME/.asdf/asdf.sh" 2>/dev/null || true

    if ! ask_yes_no "Deseja instalar múltiplas versões do Python?" "y"; then
        return
    fi

    info "Instalando plugin Python no ASDF..."

    # Adiciona plugin do Python se ainda não existe
    if ! asdf plugin list | grep -q "^python$"; then
        asdf plugin add python
    fi

    # Versões do Python para instalar
    local python_versions=("3.14.0" "3.13.1" "3.12.8")

    info "Versões que serão instaladas: ${python_versions[*]}"

    # Instala dependências necessárias para compilar o Python (Ubuntu/Debian)
    if is_linux && command_exists apt-get; then
        info "Instalando dependências para compilação do Python..."
        sudo apt-get update
        sudo apt-get install -y \
            build-essential \
            libssl-dev \
            zlib1g-dev \
            libbz2-dev \
            libreadline-dev \
            libsqlite3-dev \
            curl \
            git \
            libncursesw5-dev \
            xz-utils \
            tk-dev \
            libxml2-dev \
            libxmlsec1-dev \
            libffi-dev \
            liblzma-dev
    elif is_macos; then
        info "Instalando dependências para compilação do Python..."
        brew install openssl readline sqlite3 xz zlib tcl-tk
    fi

    # Instala cada versão do Python
    for version in "${python_versions[@]}"; do
        if asdf list python | grep -q "$version"; then
            info "Python $version já está instalado"
        else
            info "Instalando Python $version..."
            asdf install python "$version"
            success "Python $version instalado"
        fi
    done

    # Define a versão global padrão (mais recente)
    info "Definindo Python ${python_versions[0]} como versão global..."
    asdf global python "${python_versions[0]}"

    success "Múltiplas versões do Python instaladas!"
    info ""
    info "Versões instaladas:"
    asdf list python
    info ""
    info "Comandos úteis:"
    info "  asdf list python                    - Lista versões instaladas"
    info "  asdf global python 3.13.1           - Define versão global"
    info "  asdf local python 3.12.8            - Define versão para projeto atual"
    info "  asdf shell python 3.14.0            - Define versão temporária para sessão"
    info "  python --version                    - Verifica versão ativa"
}

# Bun - JavaScript runtime & toolkit
install_bun() {
    if command_exists bun; then
        info "Bun já está instalado"
        return
    fi

    if ! ask_yes_no "Deseja instalar Bun (JavaScript runtime)?" "y"; then
        return
    fi

    info "Instalando Bun..."

    if command_exists brew; then
        brew install oven-sh/bun/bun
        success "Bun instalado via Homebrew"
    else
        # Instala via script oficial do Bun
        curl -fsSL https://bun.sh/install | bash
        success "Bun instalado"
        info "Bun foi instalado em: ~/.bun/bin/bun"
        info "Reinicie o terminal ou execute: source ~/.bashrc (ou ~/.zshrc)"
    fi
}

# Docker
install_docker() {
    if command_exists docker; then
        info "Docker já está instalado"
        return
    fi

    if ! ask_yes_no "Deseja instalar Docker?" "n"; then
        return
    fi

    info "Instalando Docker..."

    if is_linux && command_exists apt-get; then
        # Remove versões antigas
        sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

        # Adiciona repositório oficial do Docker
        sudo apt-get update
        sudo apt-get install -y ca-certificates curl gnupg lsb-release

        sudo mkdir -p /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
            sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

        echo \
            "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
            $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

        # Instala Docker
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

        # Adiciona usuário ao grupo docker
        sudo usermod -aG docker "$USER"

        success "Docker instalado"
        warning "Faça logout e login novamente para usar o Docker sem sudo"

    elif is_macos; then
        warning "No macOS, instale o Docker Desktop manualmente: https://www.docker.com/products/docker-desktop"
    fi
}

# VSCode
install_vscode() {
    if command_exists code; then
        info "VSCode já está instalado"
        return
    fi

    if ! ask_yes_no "Deseja instalar VSCode?" "y"; then
        return
    fi

    info "Instalando VSCode..."

    if command_exists brew; then
        brew install --cask visual-studio-code
        success "VSCode instalado via Homebrew"
    elif is_linux && command_exists apt-get; then
        # Adiciona repositório da Microsoft
        wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > /tmp/packages.microsoft.gpg
        sudo install -D -o root -g root -m 644 /tmp/packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg
        sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
        rm -f /tmp/packages.microsoft.gpg

        # Instala
        sudo apt-get update
        sudo apt-get install -y code

        success "VSCode instalado"
    fi
}

# Cursor (AI Code Editor)
install_cursor() {
    if command_exists cursor; then
        info "Cursor já está instalado"
        return
    fi

    if ! ask_yes_no "Deseja instalar Cursor (AI Code Editor)?" "n"; then
        return
    fi

    info "Instalando Cursor..."

    if command_exists brew; then
        brew install --cask cursor
        success "Cursor instalado via Homebrew"
    elif is_linux; then
        # Download do AppImage
        local cursor_url="https://downloader.cursor.sh/linux/appImage/x64"
        local cursor_file="$HOME/.local/bin/cursor.AppImage"

        mkdir -p "$HOME/.local/bin"
        wget -O "$cursor_file" "$cursor_url"
        chmod +x "$cursor_file"

        # Cria wrapper script
        cat > "$HOME/.local/bin/cursor" << 'EOF'
#!/bin/bash
exec "$HOME/.local/bin/cursor.AppImage" "$@"
EOF
        chmod +x "$HOME/.local/bin/cursor"

        success "Cursor instalado"
        info "Execute 'cursor' para abrir o Cursor"
    fi
}

# Claude Desktop
install_claude() {
    if command_exists claude; then
        info "Claude Desktop já está instalado"
        return
    fi

    if ! ask_yes_no "Deseja instalar Claude Desktop?" "n"; then
        return
    fi

    info "Instalando Claude Desktop..."

    if is_linux; then
        # Download do AppImage
        local claude_url="https://storage.googleapis.com/osprey-downloads-c02f6a0d-347c-492b-a752-3e0651722e97/nest-win-linux-builds/Claude-x86_64.AppImage"
        local claude_file="$HOME/.local/bin/claude.AppImage"

        mkdir -p "$HOME/.local/bin"
        wget -O "$claude_file" "$claude_url"
        chmod +x "$claude_file"

        # Cria wrapper script
        cat > "$HOME/.local/bin/claude" << 'EOF'
#!/bin/bash
exec "$HOME/.local/bin/claude.AppImage" "$@"
EOF
        chmod +x "$HOME/.local/bin/claude"

        success "Claude Desktop instalado"
        info "Execute 'claude' para abrir o Claude Desktop"

    elif is_macos; then
        # Download direto do DMG
        warning "No macOS, baixe Claude Desktop manualmente: https://claude.ai/download"
        info "Ou use: brew install --cask claude (se disponível)"
    fi
}

# Zed Editor
install_zed() {
    if command_exists zed; then
        info "Zed já está instalado"
        return
    fi

    if ! ask_yes_no "Deseja instalar Zed Editor?" "y"; then
        return
    fi

    info "Instalando Zed Editor..."

    if is_linux; then
        # Instala via script oficial do Zed
        curl -f https://zed.dev/install.sh | sh

        success "Zed instalado"
        info "Execute 'zed' para abrir o Zed Editor"

    elif is_macos; then
        if command_exists brew; then
            brew install --cask zed
            success "Zed instalado via Homebrew"
        else
            warning "No macOS, instale o Homebrew ou baixe o Zed manualmente: https://zed.dev"
        fi
    fi
}

# Configurações adicionais
setup_zsh_as_default() {
    if [[ "$SHELL" == "$(which zsh)" ]]; then
        info "ZSH já é o shell padrão"
        return
    fi

    if ask_yes_no "Deseja definir ZSH como shell padrão?" "y"; then
        chsh -s "$(which zsh)"
        success "ZSH definido como shell padrão"
        warning "Faça logout e login novamente para aplicar a mudança"
    fi
}

# Desabilita sons do terminal (Linux/GNOME)
disable_terminal_sounds() {
    if is_linux && command_exists gsettings; then
        info "Desabilitando sons do terminal..."
        gsettings set org.gnome.desktop.sound event-sounds false 2>/dev/null || true
        sudo gsettings set org.gnome.desktop.sound event-sounds false 2>/dev/null || true
        success "Sons do terminal desabilitados"
    fi
}

# Desabilita/oculta o dock do GNOME
disable_gnome_dock() {
    if is_linux && command_exists gsettings; then
        info "Configurando dock do GNOME..."

        # Desabilita o Ubuntu Dock (extensão padrão do Ubuntu)
        gsettings set org.gnome.shell.extensions.dash-to-dock autohide false 2>/dev/null || true
        gsettings set org.gnome.shell.extensions.dash-to-dock dock-fixed false 2>/dev/null || true
        gsettings set org.gnome.shell.extensions.dash-to-dock intellihide false 2>/dev/null || true

        # Oculta o dock permanentemente
        gsettings set org.gnome.shell.extensions.dash-to-dock dock-position 'BOTTOM' 2>/dev/null || true
        gsettings set org.gnome.shell.extensions.dash-to-dock autohide true 2>/dev/null || true
        gsettings set org.gnome.shell.extensions.dash-to-dock autohide-in-fullscreen true 2>/dev/null || true
        gsettings set org.gnome.shell.extensions.dash-to-dock intellihide-mode 'ALL_WINDOWS' 2>/dev/null || true

        # Se preferir desabilitar completamente a extensão (requer extensões GNOME)
        # gnome-extensions disable ubuntu-dock@ubuntu.com 2>/dev/null || true

        success "Dock do GNOME configurado para ocultar automaticamente"
        info "Para desabilitar completamente, execute: gnome-extensions disable ubuntu-dock@ubuntu.com"
    fi
}

# Nerd Fonts - Fontes com ícones para terminais
install_nerd_fonts() {
    local font_dir
    if is_macos; then
        font_dir="$HOME/Library/Fonts"
    else
        font_dir="$HOME/.local/share/fonts"
    fi

    # Verifica se MesloLGS NF já está instalada
    if fc-list 2>/dev/null | grep -qi "MesloLGS NF"; then
        info "Nerd Fonts já estão instaladas"
        return
    fi

    info "Instalando Nerd Fonts (MesloLGS NF)..."

    mkdir -p "$font_dir"

    # Download das fontes MesloLGS NF (recomendada pelo Powerlevel10k)
    local base_url="https://github.com/romkatv/powerlevel10k-media/raw/master"
    local fonts=(
        "MesloLGS%20NF%20Regular.ttf"
        "MesloLGS%20NF%20Bold.ttf"
        "MesloLGS%20NF%20Italic.ttf"
        "MesloLGS%20NF%20Bold%20Italic.ttf"
    )

    for font in "${fonts[@]}"; do
        local font_name=$(echo "$font" | sed 's/%20/ /g')
        if [[ ! -f "$font_dir/$font_name" ]]; then
            curl -fsSL "$base_url/$font" -o "$font_dir/$font_name"
        fi
    done

    # Atualiza cache de fontes no Linux
    if is_linux && command_exists fc-cache; then
        fc-cache -fv "$font_dir" >/dev/null 2>&1
    fi

    success "Nerd Fonts instaladas"
    info "Fonte MesloLGS NF disponível para uso nos terminais"
}

# Terminator - Terminal emulator
install_terminator() {
    if command_exists terminator; then
        info "Terminator já está instalado"
        return
    fi

    if ! ask_yes_no "Deseja instalar Terminator (emulador de terminal)?" "n"; then
        return
    fi

    info "Instalando Terminator..."

    if is_macos; then
        warning "Terminator não está disponível nativamente no macOS"
        info "Considere usar iTerm2: brew install --cask iterm2"
    elif is_linux; then
        if command_exists brew; then
            brew install terminator
            success "Terminator instalado via Homebrew"
        elif command_exists apt-get; then
            sudo apt-get update
            sudo apt-get install -y terminator
            success "Terminator instalado"
        elif command_exists dnf; then
            sudo dnf install -y terminator
            success "Terminator instalado"
        elif command_exists pacman; then
            sudo pacman -S --noconfirm terminator
            success "Terminator instalado"
        fi
    fi
}

# Alacritty - Terminal emulator (GPU-accelerated)
install_alacritty() {
    if command_exists alacritty; then
        info "Alacritty já está instalado"
        return
    fi

    if ! ask_yes_no "Deseja instalar Alacritty (terminal GPU-accelerated)?" "n"; then
        return
    fi

    info "Instalando Alacritty..."

    if is_macos; then
        brew install --cask alacritty
        success "Alacritty instalado via Homebrew"
    elif is_linux; then
        if command_exists brew; then
            brew install alacritty
            success "Alacritty instalado via Homebrew"
        elif command_exists apt-get; then
            sudo apt-get update
            sudo apt-get install -y alacritty
            success "Alacritty instalado"
        elif command_exists dnf; then
            sudo dnf install -y alacritty
            success "Alacritty instalado"
        elif command_exists pacman; then
            sudo pacman -S --noconfirm alacritty
            success "Alacritty instalado"
        fi
    fi
}

# Kitty - Terminal emulator (GPU-based)
install_kitty() {
    if command_exists kitty; then
        info "Kitty já está instalado"
        return
    fi

    if ! ask_yes_no "Deseja instalar Kitty (terminal GPU-based)?" "n"; then
        return
    fi

    info "Instalando Kitty..."

    if is_macos; then
        brew install --cask kitty
        success "Kitty instalado via Homebrew"
    elif is_linux; then
        if command_exists brew; then
            brew install kitty
            success "Kitty instalado via Homebrew"
        elif command_exists apt-get; then
            sudo apt-get update
            sudo apt-get install -y kitty
            success "Kitty instalado"
        elif command_exists dnf; then
            sudo dnf install -y kitty
            success "Kitty instalado"
        elif command_exists pacman; then
            sudo pacman -S --noconfirm kitty
            success "Kitty instalado"
        fi
    fi
}

# Flameshot - Screenshot tool
install_and_configure_flameshot() {
    if ! is_linux; then
        return
    fi

    info "Configurando Flameshot como ferramenta de screenshot..."

    # Instala Flameshot se não estiver instalado
    if ! command_exists flameshot; then
        info "Instalando Flameshot..."
        if command_exists brew; then
            brew install flameshot
            success "Flameshot instalado via Homebrew"
        elif command_exists apt-get; then
            sudo apt-get update
            sudo apt-get install -y flameshot
            success "Flameshot instalado"
        elif command_exists dnf; then
            sudo dnf install -y flameshot
            success "Flameshot instalado"
        elif command_exists pacman; then
            sudo pacman -S --noconfirm flameshot
            success "Flameshot instalado"
        fi
    else
        info "Flameshot já está instalado"
    fi

    if command_exists gsettings; then
        info "Configurando atalhos de teclado..."

        # Desabilita atalhos padrão de screenshot do GNOME
        gsettings set org.gnome.shell.keybindings screenshot "[]" 2>/dev/null || true
        gsettings set org.gnome.shell.keybindings show-screenshot-ui "[]" 2>/dev/null || true
        gsettings set org.gnome.shell.keybindings screenshot-window "[]" 2>/dev/null || true

        # Remove atalhos antigos do settings daemon
        gsettings set org.gnome.settings-daemon.plugins.media-keys screenshot "[]" 2>/dev/null || true
        gsettings set org.gnome.settings-daemon.plugins.media-keys screenshot-clip "[]" 2>/dev/null || true
        gsettings set org.gnome.settings-daemon.plugins.media-keys window-screenshot "[]" 2>/dev/null || true
        gsettings set org.gnome.settings-daemon.plugins.media-keys area-screenshot "[]" 2>/dev/null || true

        # Configura atalhos customizados para Flameshot
        gsettings set org.gnome.settings-daemon.plugins.media-keys custom-keybindings "['/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/']"

        # Print Screen = Flameshot GUI
        gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/ name 'Flameshot'
        gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/ command 'flameshot gui'
        gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/ binding 'Print'

        success "Flameshot configurado como ferramenta padrão de screenshot"
        info "Use Print Screen para capturar screenshots com Flameshot"
    fi
}

# btop - Monitor de sistema
install_btop() {
    if command_exists btop; then
        info "btop já está instalado"
        return
    fi

    if ! ask_yes_no "Deseja instalar btop (monitor de sistema)?" "y"; then
        return
    fi

    info "Instalando btop..."

    if command_exists brew; then
        brew install btop
        success "btop instalado via Homebrew"
    elif is_linux && command_exists apt-get; then
        sudo apt-get update
        sudo apt-get install -y btop
        success "btop instalado"
    elif is_linux && command_exists dnf; then
        sudo dnf install -y btop
        success "btop instalado"
    elif is_linux && command_exists pacman; then
        sudo pacman -S --noconfirm btop
        success "btop instalado"
    fi
}

# DBeaver - Cliente de banco de dados
install_dbeaver() {
    if command_exists dbeaver; then
        info "DBeaver já está instalado"
        return
    fi

    if ! ask_yes_no "Deseja instalar DBeaver (cliente de banco de dados)?" "y"; then
        return
    fi

    info "Instalando DBeaver..."

    if command_exists brew; then
        brew install --cask dbeaver-community
        success "DBeaver instalado via Homebrew"
    elif is_linux; then
        if command_exists snap; then
            sudo snap install dbeaver-ce --classic
            success "DBeaver instalado via snap"
        elif command_exists apt-get; then
            # Instala via .deb oficial
            local dbeaver_deb="/tmp/dbeaver.deb"
            wget -O "$dbeaver_deb" "https://dbeaver.io/files/dbeaver-ce_latest_amd64.deb"
            sudo apt-get install -y "$dbeaver_deb"
            rm -f "$dbeaver_deb"
            success "DBeaver instalado via .deb"
        fi
    fi
}

# Apidog - Ferramenta de teste de APIs
install_apidog() {
    if command_exists apidog; then
        info "Apidog já está instalado"
        return
    fi

    if ! ask_yes_no "Deseja instalar Apidog (ferramenta de teste de APIs)?" "y"; then
        return
    fi

    info "Instalando Apidog..."

    if command_exists brew; then
        brew install --cask apidog
        success "Apidog instalado via Homebrew"
    elif is_linux; then
        # Download do AppImage
        local apidog_url="https://assets.apidog.com/download/Apidog-linux-latest.tar.gz"
        local apidog_tar="/tmp/apidog.tar.gz"
        local apidog_dir="$HOME/.local/share/apidog"

        mkdir -p "$HOME/.local/bin"
        mkdir -p "$apidog_dir"

        wget -O "$apidog_tar" "$apidog_url"
        tar -xzf "$apidog_tar" -C "$apidog_dir"
        rm -f "$apidog_tar"

        # Cria link simbólico
        ln -sf "$apidog_dir/Apidog" "$HOME/.local/bin/apidog"

        success "Apidog instalado"
        info "Execute 'apidog' para abrir"
    fi
}

# AWS CLI
install_aws_cli() {
    if command_exists aws; then
        info "AWS CLI já está instalado"
        return
    fi

    if ! ask_yes_no "Deseja instalar AWS CLI?" "y"; then
        return
    fi

    info "Instalando AWS CLI..."

    if command_exists brew; then
        brew install awscli
        success "AWS CLI instalado via Homebrew"
    elif is_linux; then
        local awscli_zip="/tmp/awscliv2.zip"
        curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "$awscli_zip"
        unzip -q "$awscli_zip" -d /tmp
        sudo /tmp/aws/install
        rm -rf /tmp/aws "$awscli_zip"
        success "AWS CLI instalado"
    fi

    info "Configure com: aws configure"
}

# kubectl - Kubernetes CLI
install_kubectl() {
    if command_exists kubectl; then
        info "kubectl já está instalado"
        return
    fi

    if ! ask_yes_no "Deseja instalar kubectl (Kubernetes CLI)?" "y"; then
        return
    fi

    info "Instalando kubectl..."

    if command_exists brew; then
        brew install kubectl
        success "kubectl instalado via Homebrew"
    elif is_linux && command_exists apt-get; then
        # Instala via repositório oficial do Kubernetes
        sudo apt-get update
        sudo apt-get install -y apt-transport-https ca-certificates curl gnupg

        # Adiciona chave GPG do Kubernetes
        curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.31/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
        sudo chmod 644 /etc/apt/keyrings/kubernetes-apt-keyring.gpg

        # Adiciona repositório
        echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.31/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
        sudo chmod 644 /etc/apt/sources.list.d/kubernetes.list

        sudo apt-get update
        sudo apt-get install -y kubectl

        success "kubectl instalado"
    fi

    info "Configure com: kubectl config set-context"
}

# Helm - Gerenciador de pacotes Kubernetes
install_helm() {
    if command_exists helm; then
        info "Helm já está instalado"
        return
    fi

    if ! ask_yes_no "Deseja instalar Helm (gerenciador de pacotes Kubernetes)?" "y"; then
        return
    fi

    info "Instalando Helm..."

    if command_exists brew; then
        brew install helm
        success "Helm instalado via Homebrew"
    elif is_linux; then
        curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
        success "Helm instalado"
    fi
}

# Terraform - Infraestrutura como código
install_terraform() {
    if command_exists terraform; then
        info "Terraform já está instalado"
        return
    fi

    if ! ask_yes_no "Deseja instalar Terraform?" "y"; then
        return
    fi

    info "Instalando Terraform..."

    if command_exists brew; then
        brew tap hashicorp/tap
        brew install hashicorp/tap/terraform
        success "Terraform instalado via Homebrew"
    elif is_linux && command_exists apt-get; then
        # Instala via repositório oficial da HashiCorp
        sudo apt-get update
        sudo apt-get install -y gnupg software-properties-common

        # Adiciona chave GPG da HashiCorp
        wget -O- https://apt.releases.hashicorp.com/gpg | \
            sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg

        # Adiciona repositório
        echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] \
            https://apt.releases.hashicorp.com $(lsb_release -cs) main" | \
            sudo tee /etc/apt/sources.list.d/hashicorp.list

        sudo apt-get update
        sudo apt-get install -y terraform

        success "Terraform instalado"
    fi

    info "Verifique com: terraform --version"
}

# Flutter - SDK para desenvolvimento mobile
install_flutter() {
    if command_exists flutter; then
        info "Flutter já está instalado"
        return
    fi

    if ! ask_yes_no "Deseja instalar Flutter?" "y"; then
        return
    fi

    info "Instalando Flutter..."

    if is_macos; then
        brew install --cask flutter
        success "Flutter instalado via Homebrew"
    elif is_linux; then
        if command_exists brew; then
            brew install --cask flutter
            success "Flutter instalado via Homebrew"
        elif command_exists snap; then
            sudo snap install flutter --classic
            success "Flutter instalado via snap"
        else
            # Instalação manual
            local flutter_dir="$HOME/.flutter"
            if [[ ! -d "$flutter_dir" ]]; then
                info "Instalando Flutter manualmente..."
                git clone https://github.com/flutter/flutter.git -b stable "$flutter_dir"
                success "Flutter instalado em $flutter_dir"
                info "Adicione ao PATH: export PATH=\"\$PATH:$flutter_dir/bin\""
            fi
        fi
    fi

    info "Execute 'flutter doctor' para verificar a instalação"
}

# Android Studio - IDE para desenvolvimento Android
install_android_studio() {
    if command_exists android-studio || [[ -d "/opt/android-studio" ]] || [[ -d "$HOME/android-studio" ]]; then
        info "Android Studio já está instalado"
        return
    fi

    if ! ask_yes_no "Deseja instalar Android Studio?" "y"; then
        return
    fi

    info "Instalando Android Studio..."

    if is_macos; then
        brew install --cask android-studio
        success "Android Studio instalado via Homebrew"
    elif is_linux; then
        if command_exists brew; then
            brew install --cask android-studio
            success "Android Studio instalado via Homebrew"
        elif command_exists snap; then
            sudo snap install android-studio --classic
            success "Android Studio instalado via snap"
        elif command_exists flatpak; then
            flatpak install -y flathub com.google.AndroidStudio
            success "Android Studio instalado via Flatpak"
        else
            warning "Instale manualmente: https://developer.android.com/studio"
        fi
    fi

    info "Após instalar, execute o Android Studio para configurar o SDK"
    info "Flutter precisa do Android SDK. Execute 'flutter doctor' para verificar"
}

main() {
    # Homebrew (primeiro para usar nos outros pacotes)
    install_homebrew

    # Escolhe entre Oh-My-Zsh ou Oh-My-Posh
    local theme_choice
    theme_choice=$(choose_zsh_theme_engine)

    if [[ "$theme_choice" == "omz" ]]; then
        install_oh_my_zsh_stack
    else
        install_oh_my_posh_stack
    fi

    # Ferramentas essenciais
    install_fzf
    install_asdf
    install_python_versions
    install_bun

    # Editores
    install_zed
    install_vscode
    install_cursor
    install_claude

    # Fontes (necessário para ícones nos terminais)
    install_nerd_fonts

    # Terminais
    install_terminator
    install_alacritty
    install_kitty

    # Outras ferramentas
    install_docker
    disable_terminal_sounds
    disable_gnome_dock
    install_and_configure_flameshot

    # Ferramentas DevOps/Cloud
    install_btop
    install_dbeaver
    install_apidog
    install_aws_cli
    install_kubectl
    install_helm
    install_terraform

    # Desenvolvimento Mobile
    install_flutter
    install_android_studio

    setup_zsh_as_default

    success "Ferramentas de desenvolvimento instaladas!"

    # Mostra mensagem específica do theme escolhido
    if [[ "$theme_choice" == "omz" ]]; then
        info "Theme instalado: Oh-My-Zsh + Powerlevel10k"
        info "Execute 'p10k configure' para personalizar o prompt"
    else
        info "Theme instalado: Oh-My-Posh"
        info "Theme configurado em: ~/config/themes/oh-my-posh.json"
    fi
}

# Executa apenas se for chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
