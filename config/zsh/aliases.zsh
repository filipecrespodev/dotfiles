# ============================================================================
# Dotfiles
# ============================================================================

alias dotfiles='cd ~/Workspace/My/dotfiles'
alias dotfiles-edit='${EDITOR:-vim} ~/Workspace/My/dotfiles'

# Sincroniza histórico com repo privado
dotfiles-sync() {
    local private_dir="$HOME/.dotfiles-private"
    if [[ -d "$private_dir/.git" ]]; then
        echo "Sincronizando dotfiles privados..."
        cd "$private_dir"
        git add -A
        git commit -m "sync: $(date +%Y-%m-%d\ %H:%M)" 2>/dev/null || echo "Nada para commitar"
        git push origin main
        cd - > /dev/null
        echo "✓ Sincronizado!"
    else
        echo "✗ Repositório privado não configurado"
        echo "  Execute: ./bootstrap.sh e escolha configurar repo privado"
    fi
}

# ============================================================================
# Editores
# ============================================================================

alias z="zed ."
alias c="code ."
alias cur="cursor ."

# Workspace navigation
alias work="cd ~/Workspace/Work"
alias my="cd ~/Workspace/My"
alias f="cd ~/Workspace/Facily"
alias t="cd ~/Workspace/Trevo"

# Python virtual environment
alias vc="python3 -m venv .venv"
alias va="source .venv/bin/activate"
alias vd="deactivate"

# Git shortcuts
alias g="git"
alias gs="git status"
alias ga="git add"
alias gc="git commit"
alias gp="git push"
alias gl="git pull"
alias gd="git diff"
alias gco="git checkout"
alias gb="git branch"
alias glog="git log --oneline --graph --decorate"

# Common commands
alias ll="ls -lah"
alias la="ls -A"
alias l="ls -CF"
alias ..="cd .."
alias ...="cd ../.."
alias ....="cd ../../.."

# Docker shortcuts
alias d="docker"
alias dc="docker-compose"
alias dps="docker ps"
alias dpa="docker ps -a"
alias di="docker images"
alias dex="docker exec -it"
alias dlogs="docker logs -f"

# Kubernetes shortcuts (se usar)
alias k="kubectl"
alias kgp="kubectl get pods"
alias kgs="kubectl get services"
alias kgd="kubectl get deployments"
alias kl="kubectl logs -f"
alias kex="kubectl exec -it"

# Safety
alias rm="rm -i"
alias cp="cp -i"
alias mv="mv -i"

# System
alias update="sudo apt update && sudo apt upgrade -y"
alias install="sudo apt install"
alias remove="sudo apt remove"

# Network
alias ports="netstat -tulanp"
alias myip="curl -s ifconfig.me"
