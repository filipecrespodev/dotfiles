# -----------------------------
# 🔧 Oh My Zsh Base
# -----------------------------
export ZSH="$HOME/.oh-my-zsh"

# Ativar plugins essenciais
plugins=(
  git
  zsh-autosuggestions
  zsh-syntax-highlighting
  kubectl
  docker
  npm
  pip
  python
  fzf
)

source $ZSH/oh-my-zsh.sh

# -----------------------------
# 🚀 PATHS e Ferramentas Locais
# -----------------------------
export PATH="$HOME/.local/bin:$PATH"
export PNPM_HOME="$HOME/.local/share/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac

# -----------------------------
# 🧠 Oh My Posh (Prompt)
# -----------------------------
if command -v oh-my-posh >/dev/null 2>&1; then
  eval "$(oh-my-posh init zsh --config /home/filipecrespodev/Workspace/My/dotfiles/theme/theme.omp.json)"
fi

# -----------------------------
# 🧰 Aliases
# -----------------------------
alias c="code ."
alias work="cd ~/Workspace/Work"
alias my="cd ~/Workspace/My"
alias f="cd ~/Workspace/Facily"
alias t="cd ~/Workspace/Trevo"
alias vc="python -m venv .venv"
alias vc12="python3 -m venv .venv"
alias va="source .venv/bin/activate"
alias bir='black . & isort . & ruff check app/ --fix'
alias localkafka='kubectl port-forward statefulset/kafka-controller 9092:9092 -n kafka-trevo'
alias localvalkey='kubectl port-forward service/valkey-replicas 6379:6379 -n valkey'
alias localvalkeym='kubectl port-forward service/valkey-primary 6379:6379 -n valkey'
alias stop_containers='if [ "$(docker ps -q)" ]; then docker stop $(docker ps -q); else echo "No containers are running."; fi'

# Trocar ambiente AWS/K8S rapidamente
change_env() {
  cp ~/.kube/config_$1 ~/.kube/config
  cp ~/.aws/credentials_$1 ~/.aws/credentials
}

# -----------------------------
# 🧠 Node, NVM e PNPM
# -----------------------------
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# -----------------------------
# 🧩 Autocomplete & Fuzzy Finder
# -----------------------------
# fzf (fuzzy search e autocomplete de arquivos/pastas)
[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh

# kubectl autocompletion
if command -v kubectl >/dev/null 2>&1; then
  source <(kubectl completion zsh)
fi

# poetry autocompletion (opcional)
if command -v poetry >/dev/null 2>&1; then
  mkdir -p ~/.zfunc
  poetry completions zsh > ~/.zfunc/_poetry
  fpath+=~/.zfunc
fi

# -----------------------------
# 🧬 Conda (mantém o bloco padrão)
# -----------------------------
# >>> conda initialize >>>
__conda_setup="$('/home/filipecrespodev/miniconda3/bin/conda' 'shell.zsh' 'hook' 2> /dev/null)"
if [ $? -eq 0 ]; then
    eval "$__conda_setup"
else
    if [ -f "/home/filipecrespodev/miniconda3/etc/profile.d/conda.sh" ]; then
        . "/home/filipecrespodev/miniconda3/etc/profile.d/conda.sh"
    else
        export PATH="/home/filipecrespodev/miniconda3/bin:$PATH"
    fi
fi
unset __conda_setup
# <<< conda initialize <<<