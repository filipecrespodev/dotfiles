#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m' # No Color

# Arrays globais para tracking de instalações
declare -a FAILED_INSTALLATIONS=()
declare -a SUCCESSFUL_INSTALLATIONS=()
declare -a SKIPPED_INSTALLATIONS=()

# Funções de logging
info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Verifica se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verifica se está rodando em Linux
is_linux() {
    [[ "$(uname)" == "Linux" ]]
}

# Verifica se está rodando em MacOS
is_macos() {
    [[ "$(uname)" == "Darwin" ]]
}

# Faz backup de um arquivo se ele existir
backup_file() {
    local file=$1
    if [[ -f "$file" ]] || [[ -L "$file" ]]; then
        local backup="${file}.backup.$(date +%Y%m%d_%H%M%S)"
        warning "Fazendo backup de $file para $backup"
        mv "$file" "$backup"
    fi
}

# Cria um symlink seguro (com backup)
safe_symlink() {
    local source=$1
    local target=$2

    if [[ -e "$target" ]] || [[ -L "$target" ]]; then
        backup_file "$target"
    fi

    mkdir -p "$(dirname "$target")"
    ln -sf "$source" "$target"
    success "Symlink criado: $target -> $source"
}

# Pergunta sim/não ao usuário
ask_yes_no() {
    local prompt=$1
    local default=${2:-n}

    if [[ $default == "y" ]]; then
        prompt="$prompt [Y/n]: "
    else
        prompt="$prompt [y/N]: "
    fi

    read -p "$prompt" response
    response=${response:-$default}

    [[ $response =~ ^[Yy]$ ]]
}

# Instala um pacote se não estiver instalado
install_package() {
    local package=$1

    if command_exists "$package"; then
        info "$package já está instalado"
        return 0
    fi

    info "Instalando $package..."

    if is_linux; then
        if command_exists apt-get; then
            sudo apt-get install -y "$package"
        elif command_exists dnf; then
            sudo dnf install -y "$package"
        elif command_exists pacman; then
            sudo pacman -S --noconfirm "$package"
        else
            error "Gerenciador de pacotes não suportado"
            return 1
        fi
    elif is_macos; then
        if command_exists brew; then
            brew install "$package"
        else
            error "Homebrew não está instalado"
            return 1
        fi
    fi

    success "$package instalado com sucesso"
}

# Clona ou atualiza um repositório git
clone_or_update_repo() {
    local repo=$1
    local dest=$2

    if [[ -d "$dest/.git" ]]; then
        info "Atualizando repositório em $dest"
        git -C "$dest" pull
    else
        info "Clonando $repo para $dest"
        git clone --depth=1 "$repo" "$dest"
    fi
}

# Adiciona uma linha a um arquivo se não existir
append_if_not_exists() {
    local line=$1
    local file=$2

    if ! grep -qF "$line" "$file" 2>/dev/null; then
        echo "$line" >> "$file"
        success "Adicionado ao $file: $line"
    fi
}

# ══════════════════════════════════════════════════════════════
# SISTEMA DE MENU PADRONIZADO
# ══════════════════════════════════════════════════════════════

# Variável global para armazenar seleção do menu
MENU_SELECTION=""

# Mostra cabeçalho de seção
show_section_header() {
    local title="$1"
    echo "" >&2
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}" >&2
    echo -e "${BOLD}  $title${NC}" >&2
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}" >&2
    echo "" >&2
}

# Mostra menu de seleção múltipla
# Uso: show_selection_menu "TÍTULO" "item1|desc1" "item2|desc2" ...
# Resultado em: $MENU_SELECTION
show_selection_menu() {
    local title="$1"
    shift
    local items=("$@")
    local num_items=${#items[@]}

    echo "" >&2
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}" >&2
    echo -e "${BOLD}  $title${NC}" >&2
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}" >&2
    echo "" >&2

    local i=1
    for item in "${items[@]}"; do
        local name="${item%%|*}"
        local desc="${item#*|}"
        printf "  ${BOLD}[%d]${NC} %-20s ${DIM}- %s${NC}\n" "$i" "$name" "$desc" >&2
        ((i++))
    done

    echo "" >&2
    echo -e "  ${BOLD}[*]${NC} Todos" >&2
    echo -e "  ${BOLD}[0]${NC} Nenhum / Pular" >&2
    echo "" >&2

    local selection=""
    if [[ -t 0 ]]; then
        read -p "  Digite os números separados por espaço (ex: 1 3): " selection
    elif [[ -e /dev/tty ]]; then
        read -p "  Digite os números separados por espaço (ex: 1 3): " selection </dev/tty
    else
        read -p "  Digite os números separados por espaço (ex: 1 3): " selection
    fi

    # Trata seleção e armazena em variável global
    if [[ "$selection" == "*" ]]; then
        MENU_SELECTION=$(seq 1 $num_items | tr '\n' ' ')
    elif [[ "$selection" == "0" || -z "$selection" ]]; then
        MENU_SELECTION=""
    else
        MENU_SELECTION="$selection"
    fi
}

# Mostra menu de escolha única (radio button style)
# Uso: show_single_choice_menu "TÍTULO" "item1|desc1" "item2|desc2" ...
# Resultado em: $MENU_SELECTION
show_single_choice_menu() {
    local title="$1"
    shift
    local items=("$@")
    local num_items=${#items[@]}

    echo "" >&2
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}" >&2
    echo -e "${BOLD}  $title${NC}" >&2
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}" >&2
    echo "" >&2

    local i=1
    for item in "${items[@]}"; do
        local name="${item%%|*}"
        local desc="${item#*|}"
        if [[ $i -eq 1 ]]; then
            printf "  ${BOLD}[%d]${NC} %-20s ${DIM}- %s ${GREEN}(Recomendado)${NC}\n" "$i" "$name" "$desc" >&2
        else
            printf "  ${BOLD}[%d]${NC} %-20s ${DIM}- %s${NC}\n" "$i" "$name" "$desc" >&2
        fi
        ((i++))
    done

    echo "" >&2

    local selection=""
    if [[ -t 0 ]]; then
        read -p "  Opção [1-${num_items}] (padrão: 1): " selection
    elif [[ -e /dev/tty ]]; then
        read -p "  Opção [1-${num_items}] (padrão: 1): " selection </dev/tty
    else
        read -p "  Opção [1-${num_items}] (padrão: 1): " selection
    fi

    MENU_SELECTION="${selection:-1}"
}

# ══════════════════════════════════════════════════════════════
# SISTEMA DE ERROR HANDLING
# ══════════════════════════════════════════════════════════════

# Executa instalação com tratamento de erro
# Uso: run_installation "Nome" install_function [comando_para_verificar]
run_installation() {
    local name="$1"
    local install_func="$2"
    local verify_cmd="${3:-}"

    # Verifica se já está instalado
    if [[ -n "$verify_cmd" ]] && command_exists "$verify_cmd"; then
        info "$name já está instalado"
        SKIPPED_INSTALLATIONS+=("$name")
        return 0
    fi

    info "Instalando $name..."

    # Executa a função de instalação
    if $install_func 2>&1; then
        # Verifica se foi instalado com sucesso
        if [[ -z "$verify_cmd" ]] || command_exists "$verify_cmd"; then
            SUCCESSFUL_INSTALLATIONS+=("$name")
            success "$name instalado com sucesso"
            return 0
        else
            FAILED_INSTALLATIONS+=("$name")
            error "Falha ao instalar $name (comando não encontrado após instalação)"
            return 1
        fi
    else
        FAILED_INSTALLATIONS+=("$name")
        error "Falha ao instalar $name"
        return 1
    fi
}

# Executa instalação silenciosa (sem perguntar)
run_silent_installation() {
    local name="$1"
    local install_func="$2"
    local verify_cmd="${3:-}"

    # Verifica se já está instalado
    if [[ -n "$verify_cmd" ]] && command_exists "$verify_cmd"; then
        SKIPPED_INSTALLATIONS+=("$name")
        return 0
    fi

    # Executa a função de instalação
    if $install_func >/dev/null 2>&1; then
        if [[ -z "$verify_cmd" ]] || command_exists "$verify_cmd"; then
            SUCCESSFUL_INSTALLATIONS+=("$name")
            return 0
        else
            FAILED_INSTALLATIONS+=("$name")
            return 1
        fi
    else
        FAILED_INSTALLATIONS+=("$name")
        return 1
    fi
}

# Mostra relatório final de instalação
show_installation_report() {
    echo ""
    echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}                    RELATÓRIO DE INSTALAÇÃO${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
    echo ""

    # Instalados com sucesso
    if [[ ${#SUCCESSFUL_INSTALLATIONS[@]} -gt 0 ]]; then
        echo -e "${GREEN}${BOLD}Instalados com sucesso (${#SUCCESSFUL_INSTALLATIONS[@]}):${NC}"
        for item in "${SUCCESSFUL_INSTALLATIONS[@]}"; do
            echo -e "  ${GREEN}✓${NC} $item"
        done
        echo ""
    fi

    # Já instalados (pulados)
    if [[ ${#SKIPPED_INSTALLATIONS[@]} -gt 0 ]]; then
        echo -e "${BLUE}${BOLD}Já instalados (${#SKIPPED_INSTALLATIONS[@]}):${NC}"
        for item in "${SKIPPED_INSTALLATIONS[@]}"; do
            echo -e "  ${BLUE}○${NC} $item"
        done
        echo ""
    fi

    # Falhas
    if [[ ${#FAILED_INSTALLATIONS[@]} -gt 0 ]]; then
        echo -e "${RED}${BOLD}Falhas na instalação (${#FAILED_INSTALLATIONS[@]}):${NC}"
        for item in "${FAILED_INSTALLATIONS[@]}"; do
            echo -e "  ${RED}✗${NC} $item"
        done
        echo ""
        warning "Execute novamente para tentar reinstalar os itens com falha"
    fi

    # Resumo
    echo -e "${CYAN}────────────────────────────────────────────────────────────${NC}"
    local total=$((${#SUCCESSFUL_INSTALLATIONS[@]} + ${#SKIPPED_INSTALLATIONS[@]} + ${#FAILED_INSTALLATIONS[@]}))
    echo -e "  Total: $total | ${GREEN}Sucesso: ${#SUCCESSFUL_INSTALLATIONS[@]}${NC} | ${BLUE}Pulados: ${#SKIPPED_INSTALLATIONS[@]}${NC} | ${RED}Falhas: ${#FAILED_INSTALLATIONS[@]}${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Limpa arrays de tracking (para reiniciar)
reset_installation_tracking() {
    FAILED_INSTALLATIONS=()
    SUCCESSFUL_INSTALLATIONS=()
    SKIPPED_INSTALLATIONS=()
}

# Verifica se houve falhas
has_failures() {
    [[ ${#FAILED_INSTALLATIONS[@]} -gt 0 ]]
}

export -f info success warning error
export -f command_exists is_linux is_macos
export -f backup_file safe_symlink ask_yes_no
export -f install_package clone_or_update_repo append_if_not_exists
export -f show_section_header show_selection_menu show_single_choice_menu
export -f run_installation run_silent_installation show_installation_report
export -f reset_installation_tracking has_failures
export MENU_SELECTION
export FAILED_INSTALLATIONS SUCCESSFUL_INSTALLATIONS SKIPPED_INSTALLATIONS
