#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/scripts/utils.sh"

# Banner
show_banner() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║              Dotfiles Setup - @filipecrespodev             ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
}

# Mostra menu de opções
show_menu() {
    echo ""
    echo "Escolha o tipo de instalação:"
    echo ""
    echo "  1) Minimal   - Apenas dotfiles (symlinks)"
    echo "  2) Standard  - Dotfiles + pacotes essenciais"
    echo "  3) Full      - Instalação completa (recomendado)"
    echo "  4) Custom    - Escolher o que instalar"
    echo ""
    read -p "Opção [1-4]: " choice
    echo ""

    case $choice in
        1) install_minimal ;;
        2) install_standard ;;
        3) install_full ;;
        4) install_custom ;;
        *) error "Opção inválida"; exit 1 ;;
    esac
}

# Instalação minimal - apenas symlinks
install_minimal() {
    info "Instalação Minimal - Apenas symlinks dos dotfiles"
    echo ""

    bash "${SCRIPT_DIR}/install/symlinks.sh"

    success "Instalação Minimal concluída!"
}

# Instalação standard - pacotes essenciais + symlinks
install_standard() {
    info "Instalação Standard - Pacotes essenciais + dotfiles"
    echo ""

    bash "${SCRIPT_DIR}/install/packages.sh"
    bash "${SCRIPT_DIR}/install/development.sh"
    bash "${SCRIPT_DIR}/install/symlinks.sh"

    success "Instalação Standard concluída!"
}

# Instalação completa
install_full() {
    info "Instalação Full - Tudo incluído"
    echo ""

    bash "${SCRIPT_DIR}/install/packages.sh"
    bash "${SCRIPT_DIR}/install/development.sh"
    bash "${SCRIPT_DIR}/install/symlinks.sh"

    success "Instalação Full concluída!"
}

# Instalação customizada
install_custom() {
    info "Instalação Custom - Escolha os componentes"
    echo ""

    if ask_yes_no "Instalar pacotes do sistema?" "y"; then
        bash "${SCRIPT_DIR}/install/packages.sh"
    fi

    if ask_yes_no "Instalar ferramentas de desenvolvimento?" "y"; then
        bash "${SCRIPT_DIR}/install/development.sh"
    fi

    if ask_yes_no "Criar symlinks dos dotfiles?" "y"; then
        bash "${SCRIPT_DIR}/install/symlinks.sh"
    fi

    success "Instalação Custom concluída!"
}

# Verificações pré-instalação
pre_install_checks() {
    info "Verificando requisitos..."

    # Verifica se está rodando em sistema suportado
    if ! is_linux && ! is_macos; then
        error "Sistema operacional não suportado"
        exit 1
    fi

    # Verifica se git está instalado
    if ! command_exists git; then
        error "Git não está instalado. Instale o git primeiro:"
        if is_linux; then
            echo "  sudo apt-get install git"
        elif is_macos; then
            echo "  brew install git"
        fi
        exit 1
    fi

    # Verifica se curl está instalado
    if ! command_exists curl; then
        warning "curl não está instalado. Instalando..."
        if is_linux && command_exists apt-get; then
            sudo apt-get install -y curl
        elif is_macos; then
            brew install curl
        fi
    fi

    success "Requisitos verificados"
}

# Mensagem final
show_final_message() {
    echo ""
    echo "════════════════════════════════════════════════════════════"
    success "Instalação concluída com sucesso!"
    echo "════════════════════════════════════════════════════════════"
    echo ""
    info "Próximos passos:"
    echo ""
    echo "  1. Faça logout e login novamente para aplicar todas as mudanças"
    echo "  2. Abra um novo terminal para usar o ZSH configurado"
    echo "  3. Execute 'p10k configure' para personalizar o prompt (opcional)"
    echo ""

    if command_exists zed; then
        info "Zed Editor instalado! Execute 'zed' para abrir"
    fi

    if command_exists docker && ! groups | grep -q docker; then
        warning "Lembre-se: Faça logout/login para usar Docker sem sudo"
    fi

    echo ""
    info "Para reconfigurar, execute: ./bootstrap.sh"
    echo ""
}

# Função principal
main() {
    show_banner
    pre_install_checks
    show_menu
    show_final_message
}

# Executa
main "$@"
