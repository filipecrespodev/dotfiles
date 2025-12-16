# Git Functions

# Limpa branches já mergeadas
function git_clean_merged_branches() {
    local main_branch="${1:-main}"

    echo "Limpando branches mergeadas em $main_branch..."

    git checkout "$main_branch"
    git fetch
    git pull

    # Remove branches remotas mergeadas
    git branch -r --merged | \
        grep origin | \
        grep -v '>' | \
        grep -v "$main_branch" | \
        xargs -L1 | \
        cut -d"/" -f2- | \
        xargs -I {} git push origin --delete {} 2>/dev/null || true

    # Remove branches locais mergeadas
    git branch --merged | \
        grep -v "$main_branch" | \
        xargs git branch -d 2>/dev/null || true

    git fetch -p

    echo "Limpeza concluída!"
}

# Define upstream branch automaticamente
function gsu() {
    local branch_name
    branch_name="$(git branch | awk '/^\* / { print $2 }')"

    if [[ -z "$branch_name" ]]; then
        echo "Erro: Não foi possível determinar o branch atual"
        return 1
    fi

    git branch --set-upstream-to "origin/${branch_name}" "${branch_name}"
    echo "Upstream configurado: origin/${branch_name}"
}

# Cria um novo branch e já faz push
function gcb() {
    if [[ -z "$1" ]]; then
        echo "Uso: gcb <nome-do-branch>"
        return 1
    fi

    git checkout -b "$1"
    git push -u origin "$1"
}

# Utility Functions

# Cria diretório e entra nele
function mkcd() {
    mkdir -p "$1" && cd "$1" || return
}

# Extrai arquivos compactados
function extract() {
    if [[ -f "$1" ]]; then
        case "$1" in
            *.tar.bz2)   tar xjf "$1"     ;;
            *.tar.gz)    tar xzf "$1"     ;;
            *.bz2)       bunzip2 "$1"     ;;
            *.rar)       unrar x "$1"     ;;
            *.gz)        gunzip "$1"      ;;
            *.tar)       tar xf "$1"      ;;
            *.tbz2)      tar xjf "$1"     ;;
            *.tgz)       tar xzf "$1"     ;;
            *.zip)       unzip "$1"       ;;
            *.Z)         uncompress "$1"  ;;
            *.7z)        7z x "$1"        ;;
            *)           echo "'$1' não pode ser extraído" ;;
        esac
    else
        echo "'$1' não é um arquivo válido"
    fi
}

# Busca em histórico com fzf (se instalado)
function fh() {
    if command -v fzf >/dev/null 2>&1; then
        eval "$(history | fzf +s --tac | sed 's/ *[0-9]* *//')"
    else
        echo "fzf não está instalado"
    fi
}

# Navega para diretório com fzf
function fd() {
    if command -v fzf >/dev/null 2>&1; then
        local dir
        dir=$(find "${1:-.}" -path '*/\.*' -prune -o -type d -print 2>/dev/null | fzf +m) && cd "$dir" || return
    else
        echo "fzf não está instalado"
    fi
}
