#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"

info "Verificando instalação dos dotfiles..."
echo ""

# Verifica ZSH
check_zsh() {
    info "Verificando ZSH..."

    if command_exists zsh; then
        success "✓ ZSH instalado: $(zsh --version)"

        if [[ "$SHELL" == *"zsh"* ]]; then
            success "✓ ZSH é o shell padrão"
        else
            warning "⚠ ZSH não é o shell padrão. Execute: chsh -s $(which zsh)"
        fi
    else
        error "✗ ZSH não instalado"
    fi
    echo ""
}

# Verifica Oh-My-Posh
check_oh_my_posh() {
    info "Verificando Oh-My-Posh..."

    if command_exists oh-my-posh; then
        success "✓ Oh-My-Posh instalado: $(oh-my-posh version)"

        if [[ -f "$HOME/config/themes/oh-my-posh.json" ]]; then
            success "✓ Tema configurado"
        else
            warning "⚠ Tema não encontrado em ~/config/themes/oh-my-posh.json"
        fi
    else
        error "✗ Oh-My-Posh não instalado"
    fi
    echo ""
}

# Verifica fontes
check_fonts() {
    info "Verificando fontes..."

    if command_exists fc-list; then
        local jetbrains_count=$(fc-list | grep -i "JetBrains" | wc -l)
        if [ "$jetbrains_count" -gt 0 ]; then
            success "✓ JetBrains Mono Nerd Font instalada ($jetbrains_count variantes)"
        else
            warning "⚠ JetBrains Mono Nerd Font não encontrada"
        fi
    else
        warning "⚠ fc-list não disponível"
    fi
    echo ""
}

# Verifica terminais
check_terminals() {
    info "Verificando terminais..."

    if command_exists alacritty; then
        success "✓ Alacritty instalado"
        if [[ -f "$HOME/.config/alacritty/alacritty.toml" ]]; then
            success "  ✓ Configuração encontrada"
        else
            warning "  ⚠ Configuração não encontrada"
        fi
    fi

    if command_exists kitty; then
        success "✓ Kitty instalado"
        if [[ -f "$HOME/.config/kitty/kitty.conf" ]]; then
            success "  ✓ Configuração encontrada"
        else
            warning "  ⚠ Configuração não encontrada"
        fi
    fi

    if ! command_exists alacritty && ! command_exists kitty; then
        warning "⚠ Nenhum terminal moderno instalado"
    fi
    echo ""
}

# Verifica terminal padrão
check_default_terminal() {
    info "Verificando terminal padrão..."

    if command_exists update-alternatives; then
        local default_term=$(update-alternatives --query x-terminal-emulator 2>/dev/null | grep Value | awk '{print $2}')
        if [[ -n "$default_term" ]]; then
            success "✓ Terminal padrão: $default_term"
        else
            warning "⚠ Terminal padrão não configurado"
        fi
    fi

    if command_exists gsettings; then
        local gnome_term=$(gsettings get org.gnome.desktop.default-applications.terminal exec 2>/dev/null | tr -d "'")
        if [[ -n "$gnome_term" && "$gnome_term" != "gnome-terminal" ]]; then
            success "✓ Terminal GNOME: $gnome_term"
        fi
    fi
    echo ""
}

# Verifica symlinks
check_symlinks() {
    info "Verificando symlinks..."

    local files=(
        "$HOME/.zshrc"
        "$HOME/.gitconfig"
        "$HOME/.vimrc"
        "$HOME/.tmux.conf"
    )

    local missing=0
    for file in "${files[@]}"; do
        if [[ -L "$file" ]]; then
            success "✓ $(basename $file) → $(readlink $file)"
        elif [[ -f "$file" ]]; then
            warning "⚠ $(basename $file) existe mas não é um symlink"
        else
            error "✗ $(basename $file) não encontrado"
            ((missing++))
        fi
    done

    if [ $missing -eq 0 ]; then
        success "✓ Todos os symlinks configurados"
    fi
    echo ""
}

# Verifica plugins ZSH
check_zsh_plugins() {
    info "Verificando plugins ZSH..."

    if [[ -d "$HOME/.zsh/zsh-autosuggestions" ]]; then
        success "✓ zsh-autosuggestions instalado"
    else
        warning "⚠ zsh-autosuggestions não encontrado"
    fi

    if [[ -d "$HOME/.zsh/zsh-syntax-highlighting" ]]; then
        success "✓ zsh-syntax-highlighting instalado"
    else
        warning "⚠ zsh-syntax-highlighting não encontrado"
    fi
    echo ""
}

# Verifica ferramentas
check_tools() {
    info "Verificando ferramentas..."

    local tools=("git" "curl" "wget" "vim" "tmux" "fzf" "rg" "flameshot")

    for tool in "${tools[@]}"; do
        if command_exists "$tool"; then
            success "✓ $tool instalado"
        else
            warning "⚠ $tool não instalado"
        fi
    done
    echo ""
}

# Verifica Flameshot
check_flameshot() {
    info "Verificando Flameshot..."

    if command_exists flameshot; then
        success "✓ Flameshot instalado"

        if [[ -f "$HOME/.config/flameshot/flameshot.ini" ]]; then
            success "  ✓ Configuração encontrada"
        else
            warning "  ⚠ Configuração não encontrada"
        fi

        if [[ -f "$HOME/.config/autostart/flameshot.desktop" ]]; then
            success "  ✓ Autostart configurado"
        else
            warning "  ⚠ Autostart não configurado"
        fi

        # Verifica atalhos no GNOME
        if command_exists gsettings; then
            local print_binding=$(gsettings get org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/flameshot-gui/ binding 2>/dev/null | tr -d "'")
            if [[ "$print_binding" == "Print" ]]; then
                success "  ✓ Atalho Print Screen configurado"
            else
                warning "  ⚠ Atalho Print Screen não configurado"
            fi
        fi
    else
        warning "⚠ Flameshot não instalado"
    fi
    echo ""
}

# Resumo
show_summary() {
    echo "======================================"
    info "Resumo da Verificação"
    echo "======================================"
    echo ""
    echo "Execute os seguintes comandos se necessário:"
    echo ""

    if ! command_exists oh-my-posh; then
        echo "  # Instalar Oh-My-Posh:"
        echo "  curl -s https://ohmyposh.dev/install.sh | bash -s"
        echo ""
    fi

    if ! fc-list | grep -qi "JetBrains"; then
        echo "  # Instalar fontes:"
        echo "  ./install/fonts.sh"
        echo ""
    fi

    if [[ "$SHELL" != *"zsh"* ]]; then
        echo "  # Definir ZSH como shell padrão:"
        echo "  chsh -s \$(which zsh)"
        echo ""
    fi

    if [[ ! -L "$HOME/.zshrc" ]]; then
        echo "  # Criar symlinks:"
        echo "  ./install/symlinks.sh"
        echo ""
    fi

    if ! command_exists flameshot; then
        echo "  # Instalar e configurar Flameshot:"
        echo "  sudo apt-get install flameshot"
        echo "  ./scripts/configure-flameshot.sh"
        echo ""
    elif [[ ! -f "$HOME/.config/flameshot/flameshot.ini" ]]; then
        echo "  # Configurar Flameshot:"
        echo "  ./scripts/configure-flameshot.sh"
        echo ""
    fi

    echo "Para mais informações, consulte o README.md"
}

main() {
    check_zsh
    check_oh_my_posh
    check_fonts
    check_terminals
    check_default_terminal
    check_flameshot
    check_symlinks
    check_zsh_plugins
    check_tools
    show_summary
}

main "$@"
