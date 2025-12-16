#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../scripts/utils.sh"

info "Instalando ferramentas de desenvolvimento..."

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
    if [[ -d "$HOME/.fzf" ]]; then
        info "FZF já está instalado"
        return
    fi

    info "Instalando FZF..."
    git clone --depth 1 https://github.com/junegunn/fzf.git "$HOME/.fzf"
    "$HOME/.fzf/install" --all --no-bash --no-fish

    success "FZF instalado"
}

# ASDF - Version manager
install_asdf() {
    if [[ -d "$HOME/.asdf" ]]; then
        info "ASDF já está instalado"
        return
    fi

    info "Instalando ASDF..."
    git clone https://github.com/asdf-vm/asdf.git "$HOME/.asdf" --branch v0.14.0

    success "ASDF instalado"
    info "Configure os plugins do ASDF conforme necessário:"
    info "  asdf plugin add nodejs"
    info "  asdf plugin add python"
    info "  asdf plugin add golang"
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

    # Instala via script oficial do Bun
    curl -fsSL https://bun.sh/install | bash

    success "Bun instalado"
    info "Bun foi instalado em: ~/.bun/bin/bun"
    info "Reinicie o terminal ou execute: source ~/.bashrc (ou ~/.zshrc)"
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

    if is_linux && command_exists apt-get; then
        # Adiciona repositório da Microsoft
        wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > /tmp/packages.microsoft.gpg
        sudo install -D -o root -g root -m 644 /tmp/packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg
        sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
        rm -f /tmp/packages.microsoft.gpg

        # Instala
        sudo apt-get update
        sudo apt-get install -y code

        success "VSCode instalado"

    elif is_macos; then
        brew install --cask visual-studio-code
        success "VSCode instalado via Homebrew"
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

    if is_linux; then
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

    elif is_macos; then
        brew install --cask cursor
        success "Cursor instalado via Homebrew"
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

main() {
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
    install_bun

    # Editores (opcionais)
    install_zed
    install_vscode
    install_cursor
    install_claude

    # Outras ferramentas
    install_docker
    disable_terminal_sounds
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
