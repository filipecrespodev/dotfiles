#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

export -f info success warning error
export -f command_exists is_linux is_macos
export -f backup_file safe_symlink ask_yes_no
export -f install_package clone_or_update_repo append_if_not_exists
