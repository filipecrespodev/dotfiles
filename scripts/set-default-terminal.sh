#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"

info "Configurando terminal padrão do sistema..."

# Detecta terminais instalados
detect_terminals() {
    local terminals=()

    if command_exists alacritty; then
        terminals+=("alacritty")
    fi

    if command_exists kitty; then
        terminals+=("kitty")
    fi

    if command_exists gnome-terminal; then
        terminals+=("gnome-terminal")
    fi

    if command_exists konsole; then
        terminals+=("konsole")
    fi

    if command_exists xfce4-terminal; then
        terminals+=("xfce4-terminal")
    fi

    echo "${terminals[@]}"
}

# Configura terminal padrão no Ubuntu/Debian (update-alternatives)
set_default_debian() {
    local terminal="$1"

    info "Configurando $terminal como terminal padrão (Debian/Ubuntu)..."

    # Instala como alternativa se não existir
    if ! sudo update-alternatives --list x-terminal-emulator | grep -q "$terminal"; then
        local terminal_path=$(which "$terminal")
        sudo update-alternatives --install /usr/bin/x-terminal-emulator x-terminal-emulator "$terminal_path" 100
    fi

    # Define como padrão
    sudo update-alternatives --set x-terminal-emulator "$(which $terminal)"

    success "Terminal padrão configurado via update-alternatives"
}

# Configura terminal padrão via gsettings (GNOME)
set_default_gnome() {
    local terminal="$1"

    if ! command_exists gsettings; then
        return
    fi

    info "Configurando $terminal como terminal padrão (GNOME)..."

    # Para GNOME 3.8+
    gsettings set org.gnome.desktop.default-applications.terminal exec "$terminal" 2>/dev/null || true
    gsettings set org.gnome.desktop.default-applications.terminal exec-arg "-e" 2>/dev/null || true

    success "Terminal padrão configurado no GNOME"
}

# Configura terminal padrão via xdg
set_default_xdg() {
    local terminal="$1"

    info "Configurando $terminal via XDG..."

    # Cria arquivo .desktop customizado se necessário
    local desktop_file="$HOME/.local/share/applications/${terminal}-default.desktop"
    mkdir -p "$HOME/.local/share/applications"

    case "$terminal" in
        alacritty)
            cat > "$desktop_file" << 'EOF'
[Desktop Entry]
Type=Application
Name=Alacritty
Comment=A fast, cross-platform, OpenGL terminal emulator
Exec=alacritty
Icon=Alacritty
Terminal=false
Categories=System;TerminalEmulator;
Keywords=shell;prompt;command;commandline;
StartupWMClass=Alacritty
Actions=New;

[Desktop Action New]
Name=New Terminal
Exec=alacritty
EOF
            ;;
        kitty)
            cat > "$desktop_file" << 'EOF'
[Desktop Entry]
Type=Application
Name=Kitty
Comment=Fast, feature-rich, GPU based terminal
Exec=kitty
Icon=kitty
Terminal=false
Categories=System;TerminalEmulator;
Keywords=shell;prompt;command;commandline;
StartupWMClass=kitty
Actions=New;

[Desktop Action New]
Name=New Terminal
Exec=kitty
EOF
            ;;
    esac

    # Define como padrão para x-terminal-emulator
    xdg-mime default "${terminal}-default.desktop" application/x-terminal-emulator 2>/dev/null || true

    # Atualiza cache de desktop files
    if command_exists update-desktop-database; then
        update-desktop-database "$HOME/.local/share/applications" 2>/dev/null || true
    fi

    success "Terminal configurado via XDG"
}

# Configura atalho de teclado no GNOME
set_gnome_keybinding() {
    local terminal="$1"

    if ! command_exists gsettings; then
        return
    fi

    info "Configurando atalho Ctrl+Alt+T para $terminal..."

    # Desabilita o atalho padrão do gnome-terminal se existir
    gsettings set org.gnome.settings-daemon.plugins.media-keys terminal '' 2>/dev/null || true

    # Configurar atalho customizado
    local custom_path="org.gnome.settings-daemon.plugins.media-keys.custom-keybinding"
    local custom_keybindings_path="org.gnome.settings-daemon.plugins.media-keys"
    local keybinding_path="/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/"

    # Define o caminho do atalho customizado
    gsettings set $custom_keybindings_path custom-keybindings "['$keybinding_path']" 2>/dev/null || true

    # Configura o atalho
    gsettings set ${custom_path}:${keybinding_path} name "Terminal" 2>/dev/null || true
    gsettings set ${custom_path}:${keybinding_path} command "$terminal" 2>/dev/null || true
    gsettings set ${custom_path}:${keybinding_path} binding "<Primary><Alt>t" 2>/dev/null || true

    success "Atalho Ctrl+Alt+T configurado"
}

# Configura atalho no XFCE
set_xfce_keybinding() {
    local terminal="$1"

    if ! command_exists xfconf-query; then
        return
    fi

    info "Configurando atalho no XFCE..."

    xfconf-query -c xfce4-keyboard-shortcuts -p "/commands/custom/<Primary><Alt>t" -s "$terminal" --create -t string 2>/dev/null || true

    success "Atalho configurado no XFCE"
}

# Mostra menu de seleção
show_menu() {
    local terminals=($1)

    if [ ${#terminals[@]} -eq 0 ]; then
        error "Nenhum terminal moderno encontrado!"
        echo "Instale Alacritty ou Kitty primeiro:"
        echo "  ./install/packages.sh"
        exit 1
    fi

    echo ""
    echo "Terminais disponíveis:"
    echo ""

    local i=1
    for term in "${terminals[@]}"; do
        echo "  $i) $term"
        ((i++))
    done

    echo ""
    read -p "Escolha o terminal padrão [1-${#terminals[@]}] (padrão: 1): " choice
    choice=${choice:-1}

    if [ "$choice" -lt 1 ] || [ "$choice" -gt ${#terminals[@]} ]; then
        error "Opção inválida!"
        exit 1
    fi

    echo "${terminals[$((choice-1))]}"
}

main() {
    # Detecta terminais instalados
    local terminals=$(detect_terminals)

    if [ -z "$terminals" ]; then
        error "Nenhum terminal encontrado!"
        exit 1
    fi

    # Se recebeu terminal como argumento, usa ele
    local terminal="$1"

    # Senão, mostra menu
    if [ -z "$terminal" ]; then
        terminal=$(show_menu "$terminals")
    fi

    # Valida se o terminal existe
    if ! command_exists "$terminal"; then
        error "Terminal '$terminal' não encontrado!"
        exit 1
    fi

    echo ""
    info "Configurando $terminal como terminal padrão..."
    echo ""

    # Aplica configurações conforme o sistema
    if is_linux; then
        # Debian/Ubuntu - update-alternatives
        if command_exists update-alternatives; then
            set_default_debian "$terminal"
        fi

        # GNOME
        if [ "$XDG_CURRENT_DESKTOP" = "GNOME" ] || [ "$XDG_CURRENT_DESKTOP" = "ubuntu:GNOME" ]; then
            set_default_gnome "$terminal"
            set_gnome_keybinding "$terminal"
        fi

        # XFCE
        if [ "$XDG_CURRENT_DESKTOP" = "XFCE" ]; then
            set_xfce_keybinding "$terminal"
        fi

        # XDG (universal)
        set_default_xdg "$terminal"
    elif is_macos; then
        warning "macOS detectado. Configure o terminal padrão manualmente nas Preferências do Sistema."
    fi

    echo ""
    success "✓ $terminal configurado como terminal padrão!"
    echo ""
    info "Testando configuração:"
    echo "  • Pressione Ctrl+Alt+T para abrir o terminal"
    echo "  • Ou execute: x-terminal-emulator"
    echo ""
    warning "Nota: Pode ser necessário fazer logout/login para todas as mudanças terem efeito."
}

# Executa apenas se for chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
