#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"

info "Configurando Flameshot como ferramenta padrão de screenshot..."

# Verifica se Flameshot está instalado
if ! command_exists flameshot; then
    error "Flameshot não está instalado!"
    echo "Execute: sudo apt-get install flameshot"
    exit 1
fi

# Desabilita atalhos nativos de screenshot
disable_native_screenshot_shortcuts() {
    if ! command_exists gsettings; then
        return
    fi

    info "Desabilitando atalhos nativos de screenshot..."

    # Desabilita TODOS os atalhos de screenshot do GNOME
    gsettings set org.gnome.settings-daemon.plugins.media-keys screenshot '[]' 2>/dev/null || true
    gsettings set org.gnome.settings-daemon.plugins.media-keys screenshot-clip '[]' 2>/dev/null || true
    gsettings set org.gnome.settings-daemon.plugins.media-keys area-screenshot '[]' 2>/dev/null || true
    gsettings set org.gnome.settings-daemon.plugins.media-keys area-screenshot-clip '[]' 2>/dev/null || true
    gsettings set org.gnome.settings-daemon.plugins.media-keys window-screenshot '[]' 2>/dev/null || true
    gsettings set org.gnome.settings-daemon.plugins.media-keys window-screenshot-clip '[]' 2>/dev/null || true

    # Para versões mais antigas do GNOME
    gsettings set org.gnome.shell.keybindings screenshot '' 2>/dev/null || true
    gsettings set org.gnome.shell.keybindings screenshot-window '' 2>/dev/null || true
    gsettings set org.gnome.shell.keybindings show-screenshot-ui '' 2>/dev/null || true

    success "Atalhos nativos desabilitados"
}

# Configura atalho no GNOME
configure_gnome_shortcuts() {
    if ! command_exists gsettings; then
        return
    fi

    info "Configurando atalhos do Flameshot no GNOME..."

    # Primeiro desabilita os atalhos nativos
    disable_native_screenshot_shortcuts

    # Configura atalhos customizados para Flameshot
    local custom_path="org.gnome.settings-daemon.plugins.media-keys.custom-keybinding"
    local custom_keybindings_path="org.gnome.settings-daemon.plugins.media-keys"

    # Obtém atalhos existentes
    local existing_bindings=$(gsettings get $custom_keybindings_path custom-keybindings 2>/dev/null | tr -d '[]' | tr ',' '\n' | grep -v "flameshot" | tr '\n' ',' | sed 's/,$//')

    # Define os caminhos dos atalhos do Flameshot
    local flameshot_bindings="'/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/flameshot-gui/','/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/flameshot-full/','/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/flameshot-launcher/'"

    # Combina atalhos existentes (sem flameshot) com novos atalhos do flameshot
    local all_bindings="[$flameshot_bindings]"
    if [[ -n "$existing_bindings" ]]; then
        all_bindings="[$existing_bindings,$flameshot_bindings]"
    fi

    gsettings set $custom_keybindings_path custom-keybindings "$all_bindings" 2>/dev/null || true

    # Print Screen - Abre GUI do Flameshot (seleção de área)
    local gui_path="/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/flameshot-gui/"
    gsettings set ${custom_path}:${gui_path} name "Flameshot - Captura de Área" 2>/dev/null || true
    gsettings set ${custom_path}:${gui_path} command "flameshot gui" 2>/dev/null || true
    gsettings set ${custom_path}:${gui_path} binding "Print" 2>/dev/null || true

    # Ctrl+Print Screen - Screenshot da tela inteira
    local full_path="/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/flameshot-full/"
    gsettings set ${custom_path}:${full_path} name "Flameshot - Tela Inteira" 2>/dev/null || true
    gsettings set ${custom_path}:${full_path} command "flameshot full -c" 2>/dev/null || true
    gsettings set ${custom_path}:${full_path} binding "<Primary>Print" 2>/dev/null || true

    # Shift+Print Screen - Abre launcher (menu de opções)
    local launcher_path="/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/flameshot-launcher/"
    gsettings set ${custom_path}:${launcher_path} name "Flameshot - Menu" 2>/dev/null || true
    gsettings set ${custom_path}:${launcher_path} command "flameshot launcher" 2>/dev/null || true
    gsettings set ${custom_path}:${launcher_path} binding "<Shift>Print" 2>/dev/null || true

    success "Atalhos do Flameshot configurados no GNOME"
}

# Configura atalho no XFCE
configure_xfce_shortcuts() {
    if ! command_exists xfconf-query; then
        return
    fi

    info "Configurando atalhos do Flameshot no XFCE..."

    # Remove atalhos nativos do XFCE se existirem
    xfconf-query -c xfce4-keyboard-shortcuts -p "/commands/custom/Print" -r 2>/dev/null || true

    # Print Screen - GUI do Flameshot
    xfconf-query -c xfce4-keyboard-shortcuts -p "/commands/custom/Print" -s "flameshot gui" --create -t string 2>/dev/null || true

    # Ctrl+Print - Tela inteira
    xfconf-query -c xfce4-keyboard-shortcuts -p "/commands/custom/<Primary>Print" -s "flameshot full -c" --create -t string 2>/dev/null || true

    # Shift+Print - Menu/Launcher
    xfconf-query -c xfce4-keyboard-shortcuts -p "/commands/custom/<Shift>Print" -s "flameshot launcher" --create -t string 2>/dev/null || true

    success "Atalhos do Flameshot configurados no XFCE"
}

# Configura atalho no KDE
configure_kde_shortcuts() {
    if ! command_exists kwriteconfig5; then
        return
    fi

    info "Configurando atalhos do Flameshot no KDE..."

    local shortcuts_file="$HOME/.config/kglobalshortcutsrc"

    # Desabilita atalhos nativos do Spectacle (screenshot do KDE)
    if [[ -f "$shortcuts_file" ]]; then
        # Backup
        cp "$shortcuts_file" "${shortcuts_file}.backup" 2>/dev/null || true
    fi

    # Configura atalhos para Flameshot
    kwriteconfig5 --file kglobalshortcutsrc --group "org.kde.spectacle.desktop" --key "ActiveWindowScreenShot" "none,none,Capture Active Window"
    kwriteconfig5 --file kglobalshortcutsrc --group "org.kde.spectacle.desktop" --key "FullScreenScreenShot" "none,none,Capture Entire Desktop"
    kwriteconfig5 --file kglobalshortcutsrc --group "org.kde.spectacle.desktop" --key "RectangularRegionScreenShot" "none,none,Capture Rectangular Region"

    warning "KDE configurado. Você precisa adicionar os atalhos manualmente:"
    echo "  1. Abra System Settings > Shortcuts > Custom Shortcuts"
    echo "  2. Adicione: Print Screen → flameshot gui"
    echo "  3. Adicione: Ctrl+Print → flameshot full -c"
    echo "  4. Adicione: Shift+Print → flameshot launcher"
}

# Configura autostart
configure_autostart() {
    info "Configurando autostart do Flameshot..."

    local autostart_dir="$HOME/.config/autostart"
    mkdir -p "$autostart_dir"

    cat > "$autostart_dir/flameshot.desktop" << 'EOF'
[Desktop Entry]
Type=Application
Name=Flameshot
Comment=Screenshot tool
Exec=flameshot
Icon=flameshot
Terminal=false
Categories=Graphics;
Keywords=screenshot;capture;
X-GNOME-Autostart-enabled=true
EOF

    success "Autostart configurado"
}

# Cria configuração padrão do Flameshot
configure_flameshot_settings() {
    info "Criando configuração padrão do Flameshot..."

    local config_dir="$HOME/.config/flameshot"
    mkdir -p "$config_dir"

    cat > "$config_dir/flameshot.ini" << 'EOF'
[General]
disabledTrayIcon=false
showStartupLaunchMessage=false
savePath=/home/$USER/Pictures/Screenshots
savePathFixed=false
uiColor=#a6e3a1
drawColor=#f38ba8
drawThickness=2
contrastOpacity=188
contrastUiColor=#1e1e2e
showHelp=false
showSidePanelButton=true
showDesktopNotification=true
checkForUpdates=false
allowMultipleGuiInstances=false
predefinedColorPaletteLarge=true

[Shortcuts]
TYPE_ARROW=A
TYPE_CIRCLE=C
TYPE_CIRCLECOUNT=
TYPE_COMMIT_CURRENT_TOOL=Ctrl+Return
TYPE_COPY=Ctrl+C
TYPE_DELETE_CURRENT_TOOL=Del
TYPE_DRAWER=D
TYPE_EXIT=Ctrl+Q
TYPE_IMAGEUPLOADER=Return
TYPE_MARKER=M
TYPE_MOVESELECTION=Ctrl+M
TYPE_MOVE_DOWN=Down
TYPE_MOVE_LEFT=Left
TYPE_MOVE_RIGHT=Right
TYPE_MOVE_UP=Up
TYPE_OPEN_APP=Ctrl+O
TYPE_PENCIL=P
TYPE_PIN=
TYPE_PIXELATE=B
TYPE_RECTANGLE=R
TYPE_REDO=Ctrl+Shift+Z
TYPE_RESIZE_DOWN=Shift+Down
TYPE_RESIZE_LEFT=Shift+Left
TYPE_RESIZE_RIGHT=Shift+Right
TYPE_RESIZE_UP=Shift+Up
TYPE_SAVE=Ctrl+S
TYPE_SELECTION=S
TYPE_SELECTIONINDICATOR=
TYPE_SELECT_ALL=Ctrl+A
TYPE_TEXT=T
TYPE_TOGGLE_PANEL=Space
TYPE_UNDO=Ctrl+Z
EOF

    # Cria diretório de screenshots se não existir
    mkdir -p "$HOME/Pictures/Screenshots"

    success "Configuração criada em $config_dir/flameshot.ini"
}

# Mostra informações de uso
show_usage_info() {
    echo ""
    info "Atalhos configurados:"
    echo ""
    echo "  Print Screen        - Abre GUI do Flameshot (selecionar área)"
    echo "  Ctrl+Print Screen   - Screenshot da tela inteira (copia para clipboard)"
    echo "  Shift+Print Screen  - Abre launcher do Flameshot"
    echo ""
    info "Comandos úteis:"
    echo ""
    echo "  flameshot gui       - Abre interface para captura de área"
    echo "  flameshot full -c   - Captura tela inteira e copia"
    echo "  flameshot full -p ~/Pictures - Captura e salva em diretório"
    echo "  flameshot screen -n 0 - Captura monitor específico"
    echo "  flameshot launcher  - Abre menu de opções"
    echo ""
    info "Configurações:"
    echo ""
    echo "  Arquivo: ~/.config/flameshot/flameshot.ini"
    echo "  Screenshots: ~/Pictures/Screenshots/"
    echo "  Cores: Tema Catppuccin Mocha"
    echo ""
}

main() {
    echo ""
    info "Ambiente Desktop: ${XDG_CURRENT_DESKTOP:-Desconhecido}"
    echo ""

    # Detecta ambiente desktop e configura atalhos
    if [ "$XDG_CURRENT_DESKTOP" = "GNOME" ] || [ "$XDG_CURRENT_DESKTOP" = "ubuntu:GNOME" ]; then
        configure_gnome_shortcuts
    elif [ "$XDG_CURRENT_DESKTOP" = "XFCE" ]; then
        configure_xfce_shortcuts
    elif [ "$XDG_CURRENT_DESKTOP" = "KDE" ] || [[ "$XDG_CURRENT_DESKTOP" == *"KDE"* ]]; then
        configure_kde_shortcuts
    else
        warning "Desktop environment '${XDG_CURRENT_DESKTOP}' não reconhecido automaticamente."
        echo ""
        echo "Configure os atalhos manualmente:"
        echo "  Print Screen → flameshot gui"
        echo "  Ctrl+Print → flameshot full -c"
        echo "  Shift+Print → flameshot launcher"
        echo ""
    fi

    configure_autostart
    configure_flameshot_settings
    show_usage_info

    success "✓ Flameshot configurado com sucesso!"
    echo ""
    warning "Nota: Faça logout/login ou reinicie o sistema para os atalhos funcionarem."
    echo ""
    info "Iniciando Flameshot em segundo plano..."

    # Mata processo anterior se existir
    pkill flameshot 2>/dev/null || true
    sleep 1

    # Inicia novo processo
    flameshot &
    disown

    success "Flameshot iniciado!"
}

# Executa apenas se for chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
