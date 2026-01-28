#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOTFILES_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
CONFIG_DIR="${DOTFILES_DIR}/config"

source "${SCRIPT_DIR}/../scripts/utils.sh"

info "Criando symlinks dos dotfiles..."

# Configurações ZSH
setup_zsh() {
    info "Configurando ZSH..."

    if [[ -d "${CONFIG_DIR}/zsh" ]]; then
        safe_symlink "${CONFIG_DIR}/zsh/.zshrc" "$HOME/.zshrc"

        # Cria arquivo de aliases se existir
        if [[ -f "${CONFIG_DIR}/zsh/aliases.zsh" ]]; then
            safe_symlink "${CONFIG_DIR}/zsh/aliases.zsh" "$HOME/.aliases.zsh"
        fi

        # Cria arquivo de funções se existir
        if [[ -f "${CONFIG_DIR}/zsh/functions.zsh" ]]; then
            safe_symlink "${CONFIG_DIR}/zsh/functions.zsh" "$HOME/.functions.zsh"
        fi
    fi

    # Cria link simbólico para o tema do Oh-My-Posh
    if [[ -f "${CONFIG_DIR}/themes/oh-my-posh.json" ]]; then
        mkdir -p "$HOME/config/themes"
        safe_symlink "${CONFIG_DIR}/themes/oh-my-posh.json" "$HOME/config/themes/oh-my-posh.json"
    fi

    success "ZSH configurado"
}

# Configurações Git
setup_git() {
    info "Configurando Git..."

    if [[ -f "${CONFIG_DIR}/git/.gitconfig" ]]; then
        safe_symlink "${CONFIG_DIR}/git/.gitconfig" "$HOME/.gitconfig"
    fi

    success "Git configurado"
}

# Configurações Vim
setup_vim() {
    info "Configurando Vim..."

    if [[ -f "${CONFIG_DIR}/vim/.vimrc" ]]; then
        safe_symlink "${CONFIG_DIR}/vim/.vimrc" "$HOME/.vimrc"

        # Instala vim-plug se não existir
        if [[ ! -f "$HOME/.vim/autoload/plug.vim" ]]; then
            info "Instalando vim-plug..."
            curl -fLo "$HOME/.vim/autoload/plug.vim" --create-dirs \
                https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
            success "vim-plug instalado"
        fi

        # Instala plugins do vim
        if command_exists vim; then
            info "Instalando plugins do Vim..."
            vim -N "+set hidden" "+syntax on" +PlugInstall +qall || true
            success "Plugins do Vim instalados"
        fi
    fi

    success "Vim configurado"
}

# Configurações Tmux
setup_tmux() {
    info "Configurando Tmux..."

    if [[ -f "${CONFIG_DIR}/tmux/.tmux.conf" ]]; then
        safe_symlink "${CONFIG_DIR}/tmux/.tmux.conf" "$HOME/.tmux.conf"
    fi

    if [[ -f "${CONFIG_DIR}/tmux/.tmux.conf.local" ]]; then
        safe_symlink "${CONFIG_DIR}/tmux/.tmux.conf.local" "$HOME/.tmux.conf.local"
    fi

    success "Tmux configurado"
}

# Configurações Bash (para compatibilidade)
setup_bash() {
    info "Configurando Bash..."

    local bashrc="$HOME/.bashrc"

    # Adiciona source dos aliases e funções se existirem
    if [[ -f "${CONFIG_DIR}/zsh/aliases.zsh" ]]; then
        append_if_not_exists "source ~/.aliases.zsh" "$bashrc"
    fi

    if [[ -f "${CONFIG_DIR}/zsh/functions.zsh" ]]; then
        append_if_not_exists "source ~/.functions.zsh" "$bashrc"
    fi

    success "Bash configurado"
}

# Configurações Alacritty
setup_alacritty() {
    if ! command_exists alacritty; then
        return
    fi

    info "Configurando Alacritty..."

    if [[ -f "${CONFIG_DIR}/alacritty/alacritty.toml" ]]; then
        mkdir -p "$HOME/.config/alacritty"
        safe_symlink "${CONFIG_DIR}/alacritty/alacritty.toml" "$HOME/.config/alacritty/alacritty.toml"
    fi

    success "Alacritty configurado"
}

# Configurações Kitty
setup_kitty() {
    if ! command_exists kitty; then
        return
    fi

    info "Configurando Kitty..."

    if [[ -f "${CONFIG_DIR}/kitty/kitty.conf" ]]; then
        mkdir -p "$HOME/.config/kitty"
        safe_symlink "${CONFIG_DIR}/kitty/kitty.conf" "$HOME/.config/kitty/kitty.conf"
    fi

    success "Kitty configurado"
}

# Configurações Zed Editor
setup_zed() {
    if ! command_exists zed; then
        return
    fi

    info "Configurando Zed Editor..."

    # Cria diretório de configuração do Zed
    mkdir -p "$HOME/.config/zed"

    # Symlink para settings.json
    if [[ -f "${CONFIG_DIR}/zed/settings.json" ]]; then
        safe_symlink "${CONFIG_DIR}/zed/settings.json" "$HOME/.config/zed/settings.json"
    fi

    # Symlink para tasks.json (template)
    if [[ -f "${CONFIG_DIR}/zed/tasks.json" ]]; then
        safe_symlink "${CONFIG_DIR}/zed/tasks.json" "$HOME/.config/zed/tasks.json"
    fi

    success "Zed Editor configurado"
}

# Configurações Terminator
setup_terminator() {
    if ! command_exists terminator; then
        return
    fi

    info "Configurando Terminator..."

    if [[ -f "${CONFIG_DIR}/terminator/config" ]]; then
        mkdir -p "$HOME/.config/terminator"
        safe_symlink "${CONFIG_DIR}/terminator/config" "$HOME/.config/terminator/config"
    fi

    success "Terminator configurado"
}

main() {
    setup_zsh
    setup_git
    setup_vim
    setup_tmux
    setup_alacritty
    setup_kitty
    setup_terminator
    setup_zed
    setup_bash

    success "Todos os symlinks foram criados!"
    info "Nota: Faça logout e login novamente ou execute 'source ~/.zshrc' para aplicar as mudanças"
}

# Executa apenas se for chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
