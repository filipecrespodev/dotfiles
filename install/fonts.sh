#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../scripts/utils.sh"

info "Instalando JetBrains Mono Nerd Font..."

# Diretório de fontes
FONTS_DIR="$HOME/.local/share/fonts"
NERD_FONTS_DIR="$FONTS_DIR/NerdFonts"

# Cria diretório se não existir
mkdir -p "$NERD_FONTS_DIR"

# Instala JetBrains Mono Nerd Font
install_jetbrains_mono_nerd_font() {
    info "Baixando JetBrains Mono Nerd Font..."

    local font_url="https://github.com/ryanoasis/nerd-fonts/releases/latest/download/JetBrainsMono.zip"
    local temp_dir="/tmp/jetbrains-mono-nerd"

    # Remove instalação anterior se existir
    rm -rf "$temp_dir"
    mkdir -p "$temp_dir"

    # Baixa a fonte
    if command_exists wget; then
        wget -q --show-progress "$font_url" -O "$temp_dir/JetBrainsMono.zip"
    elif command_exists curl; then
        curl -L "$font_url" -o "$temp_dir/JetBrainsMono.zip"
    else
        error "wget ou curl não encontrado. Instale um deles primeiro."
        return 1
    fi

    # Extrai os arquivos
    info "Extraindo fontes..."
    unzip -q "$temp_dir/JetBrainsMono.zip" -d "$temp_dir"

    # Move apenas os arquivos .ttf para o diretório de fontes
    info "Instalando fontes..."
    find "$temp_dir" -name "*.ttf" -exec cp {} "$NERD_FONTS_DIR/" \;

    # Limpa arquivos temporários
    rm -rf "$temp_dir"

    success "JetBrains Mono Nerd Font instalada"
}

# Atualiza cache de fontes
update_font_cache() {
    info "Atualizando cache de fontes..."

    if command_exists fc-cache; then
        fc-cache -fv "$FONTS_DIR" > /dev/null 2>&1
        success "Cache de fontes atualizado"
    else
        warning "fc-cache não encontrado. As fontes podem não estar disponíveis imediatamente."
    fi
}

# Lista fontes instaladas
list_installed_fonts() {
    info "Verificando fontes instaladas..."

    if command_exists fc-list; then
        local jetbrains_count=$(fc-list | grep -i "JetBrains" | wc -l)
        if [ "$jetbrains_count" -gt 0 ]; then
            success "Encontradas $jetbrains_count variantes da JetBrains Mono Nerd Font"
        else
            warning "Nenhuma fonte JetBrains encontrada. Pode ser necessário reiniciar o terminal."
        fi
    fi
}

main() {
    install_jetbrains_mono_nerd_font
    update_font_cache
    list_installed_fonts

    echo ""
    info "Próximos passos:"
    echo "  1. Reinicie seu terminal ou aplicação"
    echo "  2. Configure a fonte 'JetBrainsMono Nerd Font' nas configurações do terminal"
    echo "  3. Recomendado: Use o tamanho 12-14 para melhor visualização"
    echo ""
    success "Instalação de fontes concluída!"
}

# Executa apenas se for chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
