#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"

FONT_NAME="JetBrainsMono Nerd Font"
FONT_SIZE=13

info "Configurando fontes para terminais..."

# Configura GNOME Terminal
configure_gnome_terminal() {
    if ! command_exists gsettings; then
        warning "gsettings não encontrado. Pulando configuração do GNOME Terminal."
        return
    fi

    info "Configurando GNOME Terminal..."

    # Obtém o profile UUID padrão
    local profile_id=$(gsettings get org.gnome.Terminal.ProfilesList default | tr -d "'")

    if [[ -z "$profile_id" ]]; then
        warning "Profile padrão do GNOME Terminal não encontrado."
        return
    fi

    local profile_path="org.gnome.Terminal.Legacy.Profile:/org/gnome/terminal/legacy/profiles:/:${profile_id}/"

    # Configura a fonte
    gsettings set "${profile_path}" use-system-font false
    gsettings set "${profile_path}" font "${FONT_NAME} ${FONT_SIZE}"

    success "GNOME Terminal configurado"
}

# Configura Tilix
configure_tilix() {
    if ! command_exists dconf; then
        warning "dconf não encontrado. Pulando configuração do Tilix."
        return
    fi

    # Verifica se Tilix está instalado
    if ! command_exists tilix; then
        return
    fi

    info "Configurando Tilix..."

    # Configura a fonte
    dconf write /com/gexperts/Tilix/profiles/2b7c4080-0ddd-46c5-8f23-563fd3ba789d/font "'${FONT_NAME} ${FONT_SIZE}'"
    dconf write /com/gexperts/Tilix/profiles/2b7c4080-0ddd-46c5-8f23-563fd3ba789d/use-system-font false

    success "Tilix configurado"
}

# Configura Terminator
configure_terminator() {
    local config_file="$HOME/.config/terminator/config"

    # Verifica se Terminator está instalado
    if ! command_exists terminator; then
        return
    fi

    info "Configurando Terminator..."

    mkdir -p "$(dirname "$config_file")"

    # Cria ou atualiza a configuração
    cat > "$config_file" << EOF
[global_config]
  suppress_multiple_term_dialog = True

[keybindings]

[profiles]
  [[default]]
    background_darkness = 0.95
    background_type = transparent
    cursor_color = "#f5e0dc"
    font = ${FONT_NAME} ${FONT_SIZE}
    foreground_color = "#cdd6f4"
    show_titlebar = False
    scrollback_infinite = True
    palette = "#45475a:#f38ba8:#a6e3a1:#f9e2af:#89b4fa:#f5c2e7:#94e2d5:#bac2de:#585b70:#f38ba8:#a6e3a1:#f9e2af:#89b4fa:#f5c2e7:#94e2d5:#a6adc8"
    use_system_font = False

[layouts]
  [[default]]
    [[[window0]]]
      type = Window
      parent = ""
    [[[child1]]]
      type = Terminal
      parent = window0

[plugins]
EOF

    success "Terminator configurado"
}

# Mostra informações sobre configuração manual
show_manual_instructions() {
    echo ""
    info "Instruções para configuração manual:"
    echo ""
    echo "  GNOME Terminal:"
    echo "    1. Abra as Preferências do terminal"
    echo "    2. Vá em 'Perfis' > 'Texto'"
    echo "    3. Desmarque 'Usar fonte do sistema'"
    echo "    4. Selecione: ${FONT_NAME} ${FONT_SIZE}"
    echo ""
    echo "  Konsole (KDE):"
    echo "    1. Vá em Configurações > Editar Perfil Atual"
    echo "    2. Na aba 'Aparência', clique em 'Editar' na fonte"
    echo "    3. Selecione: ${FONT_NAME} ${FONT_SIZE}"
    echo ""
    echo "  Visual Studio Code:"
    echo "    Adicione ao settings.json:"
    echo "    \"terminal.integrated.fontFamily\": \"${FONT_NAME}\","
    echo "    \"terminal.integrated.fontSize\": ${FONT_SIZE}"
    echo ""
    echo "  Windows Terminal:"
    echo "    Adicione ao settings.json em 'profiles.defaults':"
    echo "    \"font\": {"
    echo "        \"face\": \"${FONT_NAME}\","
    echo "        \"size\": ${FONT_SIZE}"
    echo "    }"
    echo ""
}

main() {
    # Verifica se a fonte está instalada
    if command_exists fc-list; then
        if ! fc-list | grep -qi "JetBrains"; then
            error "JetBrains Mono Nerd Font não encontrada!"
            echo "Execute primeiro: ./install/fonts.sh"
            exit 1
        fi
    fi

    # Configura terminais automaticamente
    configure_gnome_terminal
    configure_tilix
    configure_terminator

    # Mostra instruções manuais
    show_manual_instructions

    success "Configuração de fontes concluída!"
    echo ""
    warning "Nota: Pode ser necessário reiniciar os terminais para as mudanças terem efeito."
}

# Executa apenas se for chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
