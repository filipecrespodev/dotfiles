#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/scripts/utils.sh"

# Carrega funções de instalação
source "${SCRIPT_DIR}/install/packages.sh"
source "${SCRIPT_DIR}/install/development.sh"

# ══════════════════════════════════════════════════════════════
# INSTALAÇÃO DO GUM
# ══════════════════════════════════════════════════════════════

install_gum() {
    if command_exists gum; then
        return 0
    fi

    info "Instalando gum (ferramenta de menu)..."

    if command_exists brew; then
        brew install gum
    elif is_linux && command_exists apt-get; then
        sudo mkdir -p /etc/apt/keyrings
        curl -fsSL https://repo.charm.sh/apt/gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/charm.gpg
        echo "deb [signed-by=/etc/apt/keyrings/charm.gpg] https://repo.charm.sh/apt/ * *" | sudo tee /etc/apt/sources.list.d/charm.list
        sudo apt-get update
        sudo apt-get install -y gum
    else
        error "Não foi possível instalar gum"
        return 1
    fi
    success "gum instalado"
}

# ══════════════════════════════════════════════════════════════
# LISTA DE TODOS OS ITENS
# ══════════════════════════════════════════════════════════════

declare -A ITEMS=(
    # Base
    ["Homebrew"]="homebrew|brew"
    ["Pacotes Essenciais (git,curl,zsh,vim)"]="essentials|zsh"
    ["Dependências Dev"]="dev-deps|"

    # Fonts
    ["JetBrains Mono Font"]="jetbrains-font|"
    ["MesloLGS NF (Nerd Font)"]="meslo-font|"

    # Shell
    ["Oh-My-Zsh + Powerlevel10k"]="oh-my-zsh|"
    ["Oh-My-Posh"]="oh-my-posh|oh-my-posh"

    # Terminals
    ["Alacritty"]="alacritty|alacritty"
    ["Kitty"]="kitty|kitty"
    ["Terminator"]="terminator|terminator"

    # Editors
    ["Zed Editor"]="zed|zed"
    ["VSCode"]="vscode|code"
    ["Cursor"]="cursor|cursor"
    ["Claude Desktop"]="claude|claude"

    # Dev Tools
    ["FZF (Fuzzy Finder)"]="fzf|fzf"
    ["ASDF (Version Manager)"]="asdf|asdf"
    ["Python via ASDF"]="python-asdf|"
    ["Bun"]="bun|bun"
    ["Ripgrep"]="ripgrep|rg"

    # DevOps
    ["Docker"]="docker|docker"
    ["AWS CLI"]="aws-cli|aws"
    ["kubectl"]="kubectl|kubectl"
    ["Helm"]="helm|helm"
    ["Terraform"]="terraform|terraform"

    # Mobile
    ["Flutter"]="flutter|flutter"
    ["Android Studio"]="android-studio|"

    # Apps
    ["Brave Browser"]="brave|brave-browser"
    ["Discord"]="discord|discord"
    ["Spotify"]="spotify|spotify"
    ["Telegram"]="telegram|telegram-desktop"
    ["LibreOffice"]="libreoffice|libreoffice"
    ["Flameshot"]="flameshot|flameshot"

    # Database
    ["DBeaver"]="dbeaver|dbeaver"
    ["Apidog"]="apidog|apidog"

    # Monitoring
    ["btop"]="btop|btop"

    # Private
    ["Dotfiles Privados (histórico)"]="private|"
)

# ══════════════════════════════════════════════════════════════
# INSTALADORES
# ══════════════════════════════════════════════════════════════

run_installer() {
    local id="$1"

    case "$id" in
        homebrew)       run_installation "Homebrew" install_homebrew brew ;;
        essentials)     run_installation "Pacotes Essenciais" install_essentials zsh ;;
        dev-deps)       run_installation "Dependências Dev" install_dev_dependencies ;;
        jetbrains-font) run_installation "JetBrains Mono" install_jetbrains_mono ;;
        meslo-font)     run_installation "MesloLGS NF" install_meslo_nf ;;
        oh-my-zsh)      run_installation "Oh-My-Zsh + P10k" install_oh_my_zsh ;;
        oh-my-posh)     run_installation "Oh-My-Posh" install_oh_my_posh oh-my-posh ;;
        alacritty)      run_installation "Alacritty" install_alacritty alacritty ;;
        kitty)          run_installation "Kitty" install_kitty kitty ;;
        terminator)     run_installation "Terminator" install_terminator terminator ;;
        zed)            run_installation "Zed Editor" install_zed zed ;;
        vscode)         run_installation "VSCode" install_vscode code ;;
        cursor)         run_installation "Cursor" install_cursor cursor ;;
        claude)         run_installation "Claude Desktop" install_claude_desktop claude ;;
        fzf)            run_installation "FZF" install_fzf fzf ;;
        asdf)           run_installation "ASDF" install_asdf asdf ;;
        python-asdf)    run_installation "Python (ASDF)" install_python_asdf ;;
        bun)            run_installation "Bun" install_bun bun ;;
        ripgrep)        run_installation "Ripgrep" install_ripgrep rg ;;
        docker)         run_installation "Docker" install_docker docker ;;
        aws-cli)        run_installation "AWS CLI" install_aws_cli aws ;;
        kubectl)        run_installation "kubectl" install_kubectl kubectl ;;
        helm)           run_installation "Helm" install_helm helm ;;
        terraform)      run_installation "Terraform" install_terraform terraform ;;
        flutter)        run_installation "Flutter" install_flutter flutter ;;
        android-studio) run_installation "Android Studio" install_android_studio ;;
        brave)          run_installation "Brave Browser" install_brave brave-browser ;;
        discord)        run_installation "Discord" install_discord discord ;;
        spotify)        run_installation "Spotify" install_spotify spotify ;;
        telegram)       run_installation "Telegram" install_telegram telegram-desktop ;;
        libreoffice)    run_installation "LibreOffice" install_libreoffice libreoffice ;;
        flameshot)      run_installation "Flameshot" install_flameshot flameshot ;;
        dbeaver)        run_installation "DBeaver" install_dbeaver dbeaver ;;
        apidog)         run_installation "Apidog" install_apidog apidog ;;
        btop)           run_installation "btop" install_btop btop ;;
        private)        bash "${SCRIPT_DIR}/install/private.sh" ;;
    esac
}

# ══════════════════════════════════════════════════════════════
# MENU PRINCIPAL
# ══════════════════════════════════════════════════════════════

show_menu() {
    clear

    gum style \
        --border double \
        --border-foreground 212 \
        --padding "1 2" \
        --margin "1" \
        "🛠  Dotfiles Setup"

    echo ""
    gum style --foreground 212 "ESPAÇO = marcar/desmarcar  |  ENTER = confirmar  |  Ctrl+C = cancelar"
    gum style --foreground 240 "Itens com ✓ já estão instalados"
    echo ""

    # Gera lista de opções
    local options=()
    for name in "${!ITEMS[@]}"; do
        IFS='|' read -r id verify_cmd <<< "${ITEMS[$name]}"

        # Marca se já instalado
        if [[ -n "$verify_cmd" ]] && command_exists "$verify_cmd"; then
            options+=("$name ✓")
        else
            options+=("$name")
        fi
    done

    # Ordena e mostra menu
    IFS=$'\n' sorted=($(sort <<<"${options[*]}")); unset IFS

    local selected
    selected=$(printf '%s\n' "${sorted[@]}" | gum choose --no-limit --height 35)

    echo "$selected"
}

# ══════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════

main() {
    reset_installation_tracking

    # Verifica requisitos
    if ! command_exists git; then
        error "Git não está instalado"
        exit 1
    fi

    if ! command_exists curl; then
        sudo apt-get update && sudo apt-get install -y curl
    fi

    # Instala gum
    if ! install_gum; then
        exit 1
    fi

    # Mostra menu e captura seleção
    local selected
    selected=$(show_menu)

    if [[ -z "$selected" ]]; then
        warning "Nenhum item selecionado"
        exit 0
    fi

    # Confirma
    echo ""
    gum style --foreground 212 "Selecionados:"
    echo "$selected" | while read -r line; do
        echo "  • ${line% ✓}"
    done
    echo ""

    if ! gum confirm "Instalar os itens selecionados?"; then
        warning "Cancelado"
        exit 0
    fi

    # Instala cada item selecionado
    echo ""
    while IFS= read -r name; do
        [[ -z "$name" ]] && continue
        name="${name% ✓}"  # Remove o ✓ se houver

        if [[ -v "ITEMS[$name]" ]]; then
            IFS='|' read -r id verify_cmd <<< "${ITEMS[$name]}"
            run_installer "$id"
        fi
    done <<< "$selected"

    # Configura sistema
    configure_gnome_settings 2>/dev/null || true
    configure_flameshot 2>/dev/null || true

    # Symlinks
    echo ""
    if gum confirm "Criar symlinks dos dotfiles?"; then
        bash "${SCRIPT_DIR}/install/symlinks.sh"
    fi

    # Relatório final
    show_installation_report

    echo ""
    gum style \
        --border double \
        --border-foreground 82 \
        --padding "1 2" \
        "✅ Concluído!"

    echo ""
    info "Próximos passos:"
    echo "  1. Faça logout/login para aplicar as mudanças"
    echo "  2. Execute 'p10k configure' para o prompt"
    echo "  3. Use 'dotfiles-sync' para sincronizar histórico"
    echo ""
}

main "$@"
