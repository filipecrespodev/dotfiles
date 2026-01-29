#!/bin/bash

# NÃO usar set -e para permitir que o script continue mesmo com falhas

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../scripts/utils.sh"

# ══════════════════════════════════════════════════════════════
# CONFIGURAÇÃO DO REPOSITÓRIO PRIVADO
# ══════════════════════════════════════════════════════════════

# Configurações (o usuário pode alterar)
PRIVATE_REPO_SSH="git@github.com:filipecrespodev/dotfiles-private.git"
PRIVATE_DIR="$HOME/.dotfiles-private"

# Arquivos que serão linkados do repo privado
PRIVATE_FILES=(
    ".zsh_history"
    ".bash_history"
    ".ssh/config"
    ".gitconfig.local"
    ".env.local"
    ".secrets"
)

# ══════════════════════════════════════════════════════════════
# FUNÇÕES
# ══════════════════════════════════════════════════════════════

# Verifica se tem chave SSH configurada
check_ssh_key() {
    if [[ ! -f "$HOME/.ssh/id_rsa" ]] && [[ ! -f "$HOME/.ssh/id_ed25519" ]]; then
        warning "Nenhuma chave SSH encontrada"

        if ask_yes_no "Deseja gerar uma chave SSH agora?" "y"; then
            info "Gerando chave SSH Ed25519..."
            ssh-keygen -t ed25519 -C "$(git config user.email || echo 'dotfiles@local')" -f "$HOME/.ssh/id_ed25519" -N ""

            echo ""
            echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
            echo -e "${BOLD}  Adicione esta chave pública ao GitHub:${NC}"
            echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
            echo ""
            cat "$HOME/.ssh/id_ed25519.pub"
            echo ""
            echo -e "${YELLOW}1. Vá em: https://github.com/settings/ssh/new${NC}"
            echo -e "${YELLOW}2. Cole a chave acima${NC}"
            echo -e "${YELLOW}3. Pressione Enter quando terminar...${NC}"
            read -p ""
        else
            return 1
        fi
    fi

    # Testa conexão com GitHub
    if ! ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
        warning "Não foi possível autenticar com GitHub via SSH"
        info "Verifique se sua chave está adicionada em: https://github.com/settings/keys"
        return 1
    fi

    success "Conexão SSH com GitHub OK"
    return 0
}

# Verifica se o repositório privado existe no GitHub
check_private_repo_exists() {
    local repo_name="${PRIVATE_REPO_SSH##*/}"
    repo_name="${repo_name%.git}"

    if gh repo view "$repo_name" &>/dev/null 2>&1; then
        return 0
    fi
    return 1
}

# Cria o repositório privado no GitHub
create_private_repo() {
    local repo_name="${PRIVATE_REPO_SSH##*/}"
    repo_name="${repo_name%.git}"

    info "Criando repositório privado: $repo_name"

    if command_exists gh; then
        gh repo create "$repo_name" --private --description "Dotfiles privados - histórico e configs sensíveis" || {
            error "Falha ao criar repositório. Verifique se o gh está autenticado (gh auth login)"
            return 1
        }
        success "Repositório privado criado"
    else
        warning "GitHub CLI (gh) não está instalado"
        echo ""
        echo -e "${YELLOW}Crie o repositório manualmente:${NC}"
        echo "1. Vá em: https://github.com/new"
        echo "2. Nome: $repo_name"
        echo "3. Marque: Private"
        echo "4. Pressione Enter quando terminar..."
        read -p ""
    fi

    return 0
}

# Inicializa o repositório privado local
init_private_repo() {
    mkdir -p "$PRIVATE_DIR"
    cd "$PRIVATE_DIR"

    # Estrutura inicial
    mkdir -p history ssh

    # README
    cat > README.md << 'EOF'
# Dotfiles Privados

Este repositório contém configurações sensíveis que não devem ser públicas:

- `history/` - Histórico de comandos do terminal
- `ssh/` - Configurações SSH (não as chaves!)
- `secrets/` - Variáveis de ambiente e tokens

## Uso

Este repo é clonado automaticamente pelo script `bootstrap.sh` do repositório público de dotfiles.

## Segurança

- NUNCA commite chaves privadas SSH
- NUNCA commite tokens/senhas em texto puro
- Use variáveis de ambiente quando possível
EOF

    # .gitignore para o repo privado
    cat > .gitignore << 'EOF'
# Chaves SSH (NUNCA commitar)
*.pem
*.key
id_rsa
id_ed25519
id_dsa

# Arquivos temporários
*.tmp
*.swp
*~
.DS_Store
EOF

    # Arquivo de histórico inicial (será populado depois)
    touch history/.zsh_history
    touch history/.bash_history

    # Inicializa git
    git init
    git add .
    git commit -m "feat: estrutura inicial do dotfiles-private"
    git branch -M main
    git remote add origin "$PRIVATE_REPO_SSH"

    success "Repositório privado inicializado em $PRIVATE_DIR"
}

# Clona o repositório privado
clone_private_repo() {
    if [[ -d "$PRIVATE_DIR/.git" ]]; then
        info "Repositório privado já existe, atualizando..."
        cd "$PRIVATE_DIR"
        git pull origin main || true
        return 0
    fi

    info "Clonando repositório privado..."

    if git clone "$PRIVATE_REPO_SSH" "$PRIVATE_DIR" 2>/dev/null; then
        success "Repositório privado clonado"
        return 0
    else
        warning "Repositório não encontrado ou sem acesso"
        return 1
    fi
}

# Cria symlinks dos arquivos privados
link_private_files() {
    info "Criando symlinks dos arquivos privados..."

    # Histórico do ZSH
    if [[ -f "$PRIVATE_DIR/history/.zsh_history" ]]; then
        if [[ -f "$HOME/.zsh_history" ]] && [[ ! -L "$HOME/.zsh_history" ]]; then
            # Merge do histórico existente
            info "Mesclando histórico existente..."
            cat "$HOME/.zsh_history" >> "$PRIVATE_DIR/history/.zsh_history"
            # Remove duplicatas mantendo ordem
            awk '!seen[$0]++' "$PRIVATE_DIR/history/.zsh_history" > "$PRIVATE_DIR/history/.zsh_history.tmp"
            mv "$PRIVATE_DIR/history/.zsh_history.tmp" "$PRIVATE_DIR/history/.zsh_history"
        fi
        ln -sf "$PRIVATE_DIR/history/.zsh_history" "$HOME/.zsh_history"
        success "Histórico ZSH linkado"
    fi

    # Histórico do Bash
    if [[ -f "$PRIVATE_DIR/history/.bash_history" ]]; then
        if [[ -f "$HOME/.bash_history" ]] && [[ ! -L "$HOME/.bash_history" ]]; then
            cat "$HOME/.bash_history" >> "$PRIVATE_DIR/history/.bash_history"
            awk '!seen[$0]++' "$PRIVATE_DIR/history/.bash_history" > "$PRIVATE_DIR/history/.bash_history.tmp"
            mv "$PRIVATE_DIR/history/.bash_history.tmp" "$PRIVATE_DIR/history/.bash_history"
        fi
        ln -sf "$PRIVATE_DIR/history/.bash_history" "$HOME/.bash_history"
        success "Histórico Bash linkado"
    fi

    # SSH config
    if [[ -f "$PRIVATE_DIR/ssh/config" ]]; then
        mkdir -p "$HOME/.ssh"
        ln -sf "$PRIVATE_DIR/ssh/config" "$HOME/.ssh/config"
        chmod 600 "$HOME/.ssh/config"
        success "SSH config linkado"
    fi

    # Git config local (para configs que não devem ser públicas)
    if [[ -f "$PRIVATE_DIR/.gitconfig.local" ]]; then
        ln -sf "$PRIVATE_DIR/.gitconfig.local" "$HOME/.gitconfig.local"
        success ".gitconfig.local linkado"
    fi

    # Secrets/env local
    if [[ -f "$PRIVATE_DIR/.env.local" ]]; then
        ln -sf "$PRIVATE_DIR/.env.local" "$HOME/.env.local"
        success ".env.local linkado"
    fi
}

# Sincroniza o histórico de volta para o repo
sync_history() {
    if [[ ! -d "$PRIVATE_DIR/.git" ]]; then
        warning "Repositório privado não configurado"
        return 1
    fi

    cd "$PRIVATE_DIR"

    if [[ -n $(git status --porcelain) ]]; then
        info "Sincronizando histórico..."
        git add -A
        git commit -m "sync: atualização do histórico $(date +%Y-%m-%d)"
        git push origin main
        success "Histórico sincronizado"
    else
        info "Nada para sincronizar"
    fi
}

# ══════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════

setup_private_dotfiles() {
    show_section_header "DOTFILES PRIVADOS"

    echo -e "  ${DIM}Este módulo configura um repositório privado para:${NC}" >&2
    echo -e "  ${DIM}- Histórico de comandos do terminal${NC}" >&2
    echo -e "  ${DIM}- Configurações SSH${NC}" >&2
    echo -e "  ${DIM}- Variáveis de ambiente sensíveis${NC}" >&2
    echo "" >&2

    if ! ask_yes_no "Deseja configurar o repositório privado?" "y"; then
        return 0
    fi

    # Verifica SSH
    if ! check_ssh_key; then
        error "Configuração SSH necessária para continuar"
        return 1
    fi

    # Tenta clonar
    if clone_private_repo; then
        link_private_files
        success "Dotfiles privados configurados!"
    else
        # Repo não existe, pergunta se quer criar
        if ask_yes_no "Repositório não encontrado. Deseja criar um novo?" "y"; then
            create_private_repo
            init_private_repo

            # Push inicial
            cd "$PRIVATE_DIR"
            git push -u origin main || {
                error "Falha no push. Verifique as permissões SSH"
                return 1
            }

            link_private_files
            success "Dotfiles privados criados e configurados!"
        fi
    fi

    # Adiciona alias para sync
    echo ""
    info "Dica: Use 'dotfiles-sync' para sincronizar o histórico"
}

main() {
    setup_private_dotfiles
}

# Executa apenas se for chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
