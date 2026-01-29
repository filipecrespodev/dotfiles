#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"

TERMINAL="ghostty"

info "Configurando Ghostty como terminal padrão do sistema..."

# Configura terminal padrão no Ubuntu/Debian (update-alternatives)
set_default_debian() {
    info "Configurando $TERMINAL como terminal padrão (Debian/Ubuntu)..."

    # Instala como alternativa se não existir
    if ! sudo update-alternatives --list x-terminal-emulator 2>/dev/null | grep -q "$TERMINAL"; then
        local terminal_path=$(which "$TERMINAL")
        sudo update-alternatives --install /usr/bin/x-terminal-emulator x-terminal-emulator "$terminal_path" 100
    fi

    # Define como padrão
    sudo update-alternatives --set x-terminal-emulator "$(which $TERMINAL)"

    success "Terminal padrão configurado via update-alternatives"
}

# Configura terminal padrão via gsettings (GNOME)
set_default_gnome() {
    if ! command_exists gsettings; then
        return
    fi

    info "Configurando $TERMINAL como terminal padrão (GNOME)..."

    gsettings set org.gnome.desktop.default-applications.terminal exec "$TERMINAL" 2>/dev/null || true
    gsettings set org.gnome.desktop.default-applications.terminal exec-arg "-e" 2>/dev/null || true

    success "Terminal padrão configurado no GNOME"
}

# Configura terminal padrão via XDG
set_default_xdg() {
    info "Configurando $TERMINAL via XDG..."

    local desktop_file="$HOME/.local/share/applications/${TERMINAL}-default.desktop"
    mkdir -p "$HOME/.local/share/applications"

    cat > "$desktop_file" << 'EOF'
[Desktop Entry]
Type=Application
Name=Ghostty
Comment=Fast, native terminal emulator
Exec=ghostty
Icon=ghostty
Terminal=false
Categories=System;TerminalEmulator;
Keywords=shell;prompt;command;commandline;
StartupWMClass=ghostty
Actions=New;

[Desktop Action New]
Name=New Terminal
Exec=ghostty
EOF

    xdg-mime default "${TERMINAL}-default.desktop" application/x-terminal-emulator 2>/dev/null || true

    if command_exists update-desktop-database; then
        update-desktop-database "$HOME/.local/share/applications" 2>/dev/null || true
    fi

    success "Terminal configurado via XDG"
}

# Configura atalho de teclado no GNOME
set_gnome_keybinding() {
    if ! command_exists gsettings; then
        return
    fi

    info "Configurando atalho Ctrl+Alt+T para $TERMINAL..."

    # Desabilita o atalho padrão do gnome-terminal se existir
    gsettings set org.gnome.settings-daemon.plugins.media-keys terminal '' 2>/dev/null || true

    # Configurar atalho customizado
    local custom_path="org.gnome.settings-daemon.plugins.media-keys.custom-keybinding"
    local custom_keybindings_path="org.gnome.settings-daemon.plugins.media-keys"
    local keybinding_path="/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/"

    gsettings set $custom_keybindings_path custom-keybindings "['$keybinding_path']" 2>/dev/null || true

    gsettings set ${custom_path}:${keybinding_path} name "Terminal" 2>/dev/null || true
    gsettings set ${custom_path}:${keybinding_path} command "$TERMINAL" 2>/dev/null || true
    gsettings set ${custom_path}:${keybinding_path} binding "<Primary><Alt>t" 2>/dev/null || true

    success "Atalho Ctrl+Alt+T configurado para Ghostty"
}

# Configura atalho no XFCE
set_xfce_keybinding() {
    if ! command_exists xfconf-query; then
        return
    fi

    info "Configurando atalho no XFCE..."

    xfconf-query -c xfce4-keyboard-shortcuts -p "/commands/custom/<Primary><Alt>t" -s "$TERMINAL" --create -t string 2>/dev/null || true

    success "Atalho configurado no XFCE"
}

main() {
    # Valida se o Ghostty existe
    if ! command_exists "$TERMINAL"; then
        error "Ghostty não encontrado! Instale primeiro via bootstrap.sh"
        exit 1
    fi

    echo ""
    info "Configurando Ghostty como terminal padrão..."
    echo ""

    if is_linux; then
        # Debian/Ubuntu - update-alternatives
        if command_exists update-alternatives; then
            set_default_debian
        fi

        # GNOME
        if [ "$XDG_CURRENT_DESKTOP" = "GNOME" ] || [ "$XDG_CURRENT_DESKTOP" = "ubuntu:GNOME" ]; then
            set_default_gnome
            set_gnome_keybinding
        fi

        # XFCE
        if [ "$XDG_CURRENT_DESKTOP" = "XFCE" ]; then
            set_xfce_keybinding
        fi

        # XDG (universal)
        set_default_xdg
    elif is_macos; then
        warning "macOS detectado. Configure o terminal padrão manualmente nas Preferências do Sistema."
    fi

    echo ""
    success "Ghostty configurado como terminal padrão!"
    echo ""
    info "Testando configuração:"
    echo "  • Pressione Ctrl+Alt+T para abrir o Ghostty"
    echo "  • Ou execute: x-terminal-emulator"
    echo ""
    warning "Nota: Pode ser necessário fazer logout/login para todas as mudanças terem efeito."
}

# Executa apenas se for chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
