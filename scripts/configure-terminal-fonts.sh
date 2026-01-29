#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"

FONT_NAME="JetBrainsMono Nerd Font"
FONT_SIZE=13

info "Configurando fontes para terminais..."

# Mostra informações sobre configuração manual
show_manual_instructions() {
    echo ""
    info "Instruções para configuração manual:"
    echo ""
    echo "  Ghostty:"
    echo "    A fonte já está configurada no arquivo de config:"
    echo "    ~/.config/ghostty/config"
    echo "    font-family = ${FONT_NAME}"
    echo "    font-size = ${FONT_SIZE}"
    echo ""
    echo "  Visual Studio Code:"
    echo "    Adicione ao settings.json:"
    echo "    \"terminal.integrated.fontFamily\": \"${FONT_NAME}\","
    echo "    \"terminal.integrated.fontSize\": ${FONT_SIZE}"
    echo ""
}

main() {
    # Verifica se a fonte está instalada
    if command_exists fc-list; then
        if ! fc-list | grep -qi "JetBrains"; then
            error "JetBrains Mono Nerd Font não encontrada!"
            echo "Execute primeiro: ./install/packages.sh"
            exit 1
        fi
    fi

    # Mostra instruções
    show_manual_instructions

    success "Configuração de fontes concluída!"
    echo ""
    warning "Nota: Pode ser necessário reiniciar os terminais para as mudanças terem efeito."
}

# Executa apenas se for chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
