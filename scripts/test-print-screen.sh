#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"

info "Testando configuração do Print Screen com Flameshot..."
echo ""

# Verifica se Flameshot está instalado
if ! command_exists flameshot; then
    error "Flameshot não está instalado!"
    echo "Execute: sudo apt-get install flameshot"
    exit 1
fi

# Mostra informações do ambiente
info "Ambiente Desktop: ${XDG_CURRENT_DESKTOP:-Desconhecido}"
info "Sessão: ${XDG_SESSION_TYPE:-Desconhecido}"
echo ""

# Verifica se está rodando
if pgrep -x "flameshot" > /dev/null; then
    success "✓ Flameshot está rodando (PID: $(pgrep -x flameshot))"
else
    warning "⚠ Flameshot não está rodando"
    echo "  Iniciando Flameshot..."
    flameshot &
    disown
    sleep 2
    if pgrep -x "flameshot" > /dev/null; then
        success "✓ Flameshot iniciado"
    else
        error "✗ Falha ao iniciar Flameshot"
    fi
fi
echo ""

# Verifica atalhos no GNOME
check_gnome_shortcuts() {
    info "Verificando atalhos do GNOME..."

    # Verifica se atalhos nativos estão desabilitados
    local native_screenshot=$(gsettings get org.gnome.settings-daemon.plugins.media-keys screenshot 2>/dev/null)
    if [[ "$native_screenshot" == "''" ]] || [[ "$native_screenshot" == "[]" ]]; then
        success "✓ Atalhos nativos de screenshot desabilitados"
    else
        warning "⚠ Atalhos nativos ainda ativos: $native_screenshot"
    fi

    # Verifica atalhos customizados
    local custom_bindings=$(gsettings get org.gnome.settings-daemon.plugins.media-keys custom-keybindings 2>/dev/null)
    if [[ "$custom_bindings" == *"flameshot"* ]]; then
        success "✓ Atalhos do Flameshot encontrados"

        # Verifica cada atalho
        local gui_binding=$(gsettings get org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/flameshot-gui/ binding 2>/dev/null | tr -d "'")
        local full_binding=$(gsettings get org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/flameshot-full/ binding 2>/dev/null | tr -d "'")
        local launcher_binding=$(gsettings get org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/flameshot-launcher/ binding 2>/dev/null | tr -d "'")

        if [[ "$gui_binding" == "Print" ]]; then
            success "  ✓ Print Screen → flameshot gui"
        else
            warning "  ⚠ Print Screen não configurado (atual: $gui_binding)"
        fi

        if [[ "$full_binding" == "<Primary>Print" ]]; then
            success "  ✓ Ctrl+Print → flameshot full"
        else
            warning "  ⚠ Ctrl+Print não configurado (atual: $full_binding)"
        fi

        if [[ "$launcher_binding" == "<Shift>Print" ]]; then
            success "  ✓ Shift+Print → flameshot launcher"
        else
            warning "  ⚠ Shift+Print não configurado (atual: $launcher_binding)"
        fi
    else
        warning "⚠ Atalhos do Flameshot não encontrados"
    fi
    echo ""
}

# Verifica atalhos no XFCE
check_xfce_shortcuts() {
    info "Verificando atalhos do XFCE..."

    local print_cmd=$(xfconf-query -c xfce4-keyboard-shortcuts -p "/commands/custom/Print" 2>/dev/null)
    local ctrl_print_cmd=$(xfconf-query -c xfce4-keyboard-shortcuts -p "/commands/custom/<Primary>Print" 2>/dev/null)
    local shift_print_cmd=$(xfconf-query -c xfce4-keyboard-shortcuts -p "/commands/custom/<Shift>Print" 2>/dev/null)

    if [[ "$print_cmd" == "flameshot gui" ]]; then
        success "✓ Print Screen → flameshot gui"
    else
        warning "⚠ Print Screen não configurado (atual: $print_cmd)"
    fi

    if [[ "$ctrl_print_cmd" == "flameshot full -c" ]]; then
        success "✓ Ctrl+Print → flameshot full"
    else
        warning "⚠ Ctrl+Print não configurado (atual: $ctrl_print_cmd)"
    fi

    if [[ "$shift_print_cmd" == "flameshot launcher" ]]; then
        success "✓ Shift+Print → flameshot launcher"
    else
        warning "⚠ Shift+Print não configurado (atual: $shift_print_cmd)"
    fi
    echo ""
}

# Verifica configuração
check_flameshot_config() {
    info "Verificando configuração do Flameshot..."

    if [[ -f "$HOME/.config/flameshot/flameshot.ini" ]]; then
        success "✓ Arquivo de configuração encontrado"
    else
        warning "⚠ Arquivo de configuração não encontrado"
    fi

    if [[ -f "$HOME/.config/autostart/flameshot.desktop" ]]; then
        success "✓ Autostart configurado"
    else
        warning "⚠ Autostart não configurado"
    fi

    if [[ -d "$HOME/Pictures/Screenshots" ]]; then
        success "✓ Diretório de screenshots criado"
    else
        warning "⚠ Diretório de screenshots não existe"
    fi
    echo ""
}

# Testa manualmente
test_flameshot_manually() {
    echo "======================================"
    info "Teste Manual"
    echo "======================================"
    echo ""
    echo "Agora pressione as seguintes teclas para testar:"
    echo ""
    echo "  1. Print Screen        → Deve abrir GUI do Flameshot"
    echo "  2. Ctrl+Print Screen   → Deve capturar tela inteira"
    echo "  3. Shift+Print Screen  → Deve abrir menu do Flameshot"
    echo ""
    echo "Ou teste via comando:"
    echo ""
    echo "  flameshot gui          # Abre GUI"
    echo "  flameshot full -c      # Captura tela inteira"
    echo "  flameshot launcher     # Abre menu"
    echo ""
}

main() {
    # Verifica configuração
    check_flameshot_config

    # Verifica atalhos por ambiente
    if [ "$XDG_CURRENT_DESKTOP" = "GNOME" ] || [ "$XDG_CURRENT_DESKTOP" = "ubuntu:GNOME" ]; then
        if command_exists gsettings; then
            check_gnome_shortcuts
        fi
    elif [ "$XDG_CURRENT_DESKTOP" = "XFCE" ]; then
        if command_exists xfconf-query; then
            check_xfce_shortcuts
        fi
    else
        warning "Desktop environment '${XDG_CURRENT_DESKTOP}' - verificação automática não disponível"
        echo ""
    fi

    # Mostra teste manual
    test_flameshot_manually

    # Resumo
    echo "======================================"
    info "Para reconfigurar:"
    echo "======================================"
    echo ""
    echo "  ./scripts/configure-flameshot.sh"
    echo ""
}

main "$@"
