# ============================================================================
# ZSH Configuration
# ============================================================================

# Path configuration
export PATH=$HOME/bin:$HOME/.local/bin:/usr/local/bin:$PATH

# ============================================================================
# Plugins Configuration (Standalone)
# ============================================================================

# ZSH Autosuggestions
if [[ -d "$HOME/.zsh/zsh-autosuggestions" ]]; then
    source "$HOME/.zsh/zsh-autosuggestions/zsh-autosuggestions.zsh"
fi

# ZSH Syntax Highlighting
if [[ -d "$HOME/.zsh/zsh-syntax-highlighting" ]]; then
    source "$HOME/.zsh/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh"
fi

# ============================================================================
# User Configuration
# ============================================================================

# Language environment
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# Preferred editor
export EDITOR='vim'
export VISUAL='vim'

# ============================================================================
# Completion System
# ============================================================================

# Enable completion system
autoload -Uz compinit
compinit

# Case insensitive completion
zstyle ':completion:*' matcher-list 'm:{a-z}={A-Za-z}'

# Colorful completion
zstyle ':completion:*' list-colors "${(s.:.)LS_COLORS}"

# ============================================================================
# Version Managers & Language Tools
# ============================================================================

# ASDF Version Manager (gerencia Node, Python, Go, etc)
if [[ -f "$HOME/.asdf/asdf.sh" ]]; then
    source "$HOME/.asdf/asdf.sh"
    # ASDF completions
    fpath=(${ASDF_DIR}/completions $fpath)
fi

# NVM (Node Version Manager) - caso prefira ao invés de ASDF
if [[ -d "$HOME/.nvm" ]]; then
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
fi

# PNPM
if [[ -d "$HOME/.local/share/pnpm" ]]; then
    export PNPM_HOME="$HOME/.local/share/pnpm"
    case ":$PATH:" in
        *":$PNPM_HOME:"*) ;;
        *) export PATH="$PNPM_HOME:$PATH" ;;
    esac
fi

# Python
export PYTHONDONTWRITEBYTECODE=1

# Go
if command -v go &> /dev/null; then
    export GOPATH="$HOME/go"
    export PATH="$GOPATH/bin:$PATH"
fi

# Rust/Cargo
if [[ -f "$HOME/.cargo/env" ]]; then
    source "$HOME/.cargo/env"
fi

# ============================================================================
# FZF Integration
# ============================================================================

if [[ -f ~/.fzf.zsh ]]; then
    source ~/.fzf.zsh
fi

# ============================================================================
# Kubectl Completion
# ============================================================================

if command -v kubectl &> /dev/null; then
    source <(kubectl completion zsh)
fi

# ============================================================================
# Oh-My-Posh Prompt Theme
# ============================================================================

if command -v oh-my-posh &> /dev/null; then
    eval "$(oh-my-posh init zsh --config ~/config/themes/oh-my-posh.json)"
fi

# ============================================================================
# Custom Aliases and Functions
# ============================================================================

# Source custom aliases
if [[ -f ~/.aliases.zsh ]]; then
    source ~/.aliases.zsh
fi

# Source custom functions
if [[ -f ~/.functions.zsh ]]; then
    source ~/.functions.zsh
fi

# ============================================================================
# History Configuration
# ============================================================================

HISTSIZE=50000
SAVEHIST=50000
HISTFILE=~/.zsh_history

# Opções de histórico
setopt HIST_IGNORE_ALL_DUPS     # Remove duplicatas antigas
setopt HIST_FIND_NO_DUPS        # Não mostra duplicatas na busca
setopt HIST_IGNORE_DUPS         # Não salva comando se igual ao anterior
setopt HIST_IGNORE_SPACE        # IMPORTANTE: comandos com espaço no início NÃO são salvos
setopt HIST_REDUCE_BLANKS       # Remove espaços extras
setopt HIST_VERIFY              # Mostra comando antes de executar do histórico
setopt HIST_EXPIRE_DUPS_FIRST   # Remove duplicatas primeiro quando limite atingido
setopt SHARE_HISTORY            # Compartilha histórico entre sessões
setopt EXTENDED_HISTORY         # Salva timestamp dos comandos
setopt INC_APPEND_HISTORY       # Adiciona ao histórico imediatamente

# ============================================================================
# Segurança do Histórico - Ignora comandos sensíveis
# ============================================================================

# Função para filtrar comandos sensíveis do histórico
zshaddhistory() {
    local line="${1%%$'\n'}"
    local cmd="${line%% *}"

    # Ignora comandos que contêm padrões sensíveis
    [[ "$line" =~ (password|passwd|secret|token|api.?key|bearer|auth) ]] && return 1
    [[ "$line" =~ (AWS_SECRET|GITHUB_TOKEN|API_KEY|PRIVATE_KEY) ]] && return 1
    [[ "$line" =~ (curl.*(-u|--user|Authorization)) ]] && return 1
    [[ "$line" =~ (mysql.*-p|psql.*password) ]] && return 1
    [[ "$line" =~ (export.*(TOKEN|SECRET|PASSWORD|KEY)=) ]] && return 1
    [[ "$line" =~ (echo.*\|.*base64) ]] && return 1

    # Ignora comandos perigosos sem confirmação
    [[ "$line" =~ (rm -rf /|rm -rf \*|:\(\)\{) ]] && return 1

    return 0
}

# Aliases para comandos que não devem ir pro histórico
# Use: secret_cmd seu_comando_aqui
alias secret_cmd=' '  # Espaço no início = não salva no histórico

# ============================================================================
# ZSH Options
# ============================================================================

setopt AUTO_CD              # Digitar apenas o nome do diretório já faz cd
setopt AUTO_PUSHD           # Automaticamente adiciona dirs ao stack
setopt PUSHD_IGNORE_DUPS    # Não duplica entradas no stack
setopt CORRECT              # Correção de comandos
setopt INTERACTIVE_COMMENTS # Permite comentários no modo interativo

# ============================================================================
# Additional PATH
# ============================================================================

export PATH="$HOME/.local/bin:$PATH"
# bun completions
[ -s "/home/filipecrespodev/.bun/_bun" ] && source "/home/filipecrespodev/.bun/_bun"

# bun
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# Homebrew
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
