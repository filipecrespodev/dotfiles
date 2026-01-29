#!/bin/bash

# ══════════════════════════════════════════════════════════════
# FUNÇÕES DE INSTALAÇÃO - FERRAMENTAS DE DESENVOLVIMENTO
# ══════════════════════════════════════════════════════════════

# Este arquivo é sourced pelo bootstrap.sh
# As funções install_* são chamadas diretamente

SCRIPT_DIR="${SCRIPT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
[[ -z "$NC" ]] && source "${SCRIPT_DIR}/../scripts/utils.sh"

# ══════════════════════════════════════════════════════════════
# CATEGORIA: TEMA DO SHELL
# ══════════════════════════════════════════════════════════════

install_oh_my_zsh() {
    if [[ -d "$HOME/.oh-my-zsh" ]]; then
        return 0
    fi

    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

    # Powerlevel10k
    local p10k_dir="${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k"
    if [[ ! -d "$p10k_dir" ]]; then
        git clone --depth=1 https://github.com/romkatv/powerlevel10k.git "$p10k_dir"
    fi

    # ZSH plugins
    local custom_plugins="${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins"

    if [[ ! -d "$custom_plugins/zsh-syntax-highlighting" ]]; then
        git clone --depth=1 https://github.com/zsh-users/zsh-syntax-highlighting.git \
            "$custom_plugins/zsh-syntax-highlighting"
    fi

    if [[ ! -d "$custom_plugins/zsh-autosuggestions" ]]; then
        git clone --depth=1 https://github.com/zsh-users/zsh-autosuggestions.git \
            "$custom_plugins/zsh-autosuggestions"
    fi

    if [[ ! -d "$custom_plugins/zsh-completions" ]]; then
        git clone --depth=1 https://github.com/zsh-users/zsh-completions.git \
            "$custom_plugins/zsh-completions"
    fi

    return 0
}

install_oh_my_posh() {
    if command_exists oh-my-posh; then
        return 0
    fi

    if is_linux; then
        curl -s https://ohmyposh.dev/install.sh | bash -s
    elif is_macos; then
        brew install jandedobbeleer/oh-my-posh/oh-my-posh
    fi

    # Plugins standalone do ZSH
    mkdir -p "$HOME/.zsh"

    if [[ ! -d "$HOME/.zsh/zsh-syntax-highlighting" ]]; then
        git clone --depth=1 https://github.com/zsh-users/zsh-syntax-highlighting.git \
            "$HOME/.zsh/zsh-syntax-highlighting"
    fi

    if [[ ! -d "$HOME/.zsh/zsh-autosuggestions" ]]; then
        git clone --depth=1 https://github.com/zsh-users/zsh-autosuggestions.git \
            "$HOME/.zsh/zsh-autosuggestions"
    fi

    if [[ ! -d "$HOME/.zsh/zsh-completions" ]]; then
        git clone --depth=1 https://github.com/zsh-users/zsh-completions.git \
            "$HOME/.zsh/zsh-completions"
    fi

    return 0
}

category_shell() {
    local items=(
        "Oh-My-Zsh + Powerlevel10k|Framework popular com tema customizável"
        "Oh-My-Posh|Prompt moderno e rápido, configuração JSON"
    )

    echo -e "  ${YELLOW}Nota: Escolha apenas UM tema de shell${NC}" >&2

    show_single_choice_menu "TEMA DO SHELL - Escolha uma opção" "${items[@]}"

    case $MENU_SELECTION in
        1) run_installation "Oh-My-Zsh + Powerlevel10k" install_oh_my_zsh ;;
        2) run_installation "Oh-My-Posh" install_oh_my_posh oh-my-posh ;;
    esac

    # Configura ZSH como default
    if [[ "$SHELL" != "$(which zsh)" ]]; then
        if ask_yes_no "Deseja definir ZSH como shell padrão?" "y"; then
            chsh -s "$(which zsh)" || true
            success "ZSH será o shell padrão após logout/login"
        fi
    fi
}

# ══════════════════════════════════════════════════════════════
# CATEGORIA: EDITORES
# ══════════════════════════════════════════════════════════════

install_zed() {
    if is_linux; then
        curl -f https://zed.dev/install.sh | sh
    elif is_macos; then
        brew install --cask zed
    fi
    return 0
}

install_vscode() {
    if command_exists brew; then
        brew install --cask visual-studio-code
    elif is_linux && command_exists apt-get; then
        wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > /tmp/packages.microsoft.gpg
        sudo install -D -o root -g root -m 644 /tmp/packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg
        sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
        rm -f /tmp/packages.microsoft.gpg
        sudo apt-get update
        sudo apt-get install -y code
    fi
    return 0
}

install_cursor() {
    if command_exists brew; then
        brew install --cask cursor
    elif is_linux; then
        local cursor_url="https://downloader.cursor.sh/linux/appImage/x64"
        local cursor_file="$HOME/.local/bin/cursor.AppImage"
        mkdir -p "$HOME/.local/bin"
        wget -O "$cursor_file" "$cursor_url"
        chmod +x "$cursor_file"
        cat > "$HOME/.local/bin/cursor" << 'EOF'
#!/bin/bash
exec "$HOME/.local/bin/cursor.AppImage" "$@"
EOF
        chmod +x "$HOME/.local/bin/cursor"
    fi
    return 0
}

install_claude_desktop() {
    if is_linux; then
        local claude_url="https://storage.googleapis.com/osprey-downloads-c02f6a0d-347c-492b-a752-3e0651722e97/nest-win-linux-builds/Claude-x86_64.AppImage"
        local claude_file="$HOME/.local/bin/claude.AppImage"
        mkdir -p "$HOME/.local/bin"
        wget -O "$claude_file" "$claude_url"
        chmod +x "$claude_file"
        cat > "$HOME/.local/bin/claude" << 'EOF'
#!/bin/bash
exec "$HOME/.local/bin/claude.AppImage" "$@"
EOF
        chmod +x "$HOME/.local/bin/claude"
    elif is_macos; then
        warning "No macOS, baixe Claude Desktop: https://claude.ai/download"
        return 1
    fi
    return 0
}

category_editors() {
    local items=(
        "Zed Editor|Editor moderno e ultra-rápido"
        "VSCode|Editor popular com muitas extensões"
        "Cursor|VSCode com IA integrada"
        "Claude Desktop|Assistente IA standalone"
    )

    show_selection_menu "EDITORES DE CÓDIGO - Selecione os editores" "${items[@]}"

    for num in $MENU_SELECTION; do
        case $num in
            1) run_installation "Zed Editor" install_zed zed ;;
            2) run_installation "VSCode" install_vscode code ;;
            3) run_installation "Cursor" install_cursor cursor ;;
            4) run_installation "Claude Desktop" install_claude_desktop claude ;;
        esac
    done
}

# ══════════════════════════════════════════════════════════════
# CATEGORIA: DEV TOOLS
# ══════════════════════════════════════════════════════════════

install_fzf() {
    if command_exists fzf || [[ -d "$HOME/.fzf" ]]; then
        return 0
    fi

    if command_exists brew; then
        brew install fzf
        "$(brew --prefix)/opt/fzf/install" --all --no-bash --no-fish
    else
        git clone --depth 1 https://github.com/junegunn/fzf.git "$HOME/.fzf"
        "$HOME/.fzf/install" --all --no-bash --no-fish
    fi
    return 0
}

install_asdf() {
    if command_exists asdf || [[ -d "$HOME/.asdf" ]]; then
        return 0
    fi

    if command_exists brew; then
        brew install asdf
    else
        git clone https://github.com/asdf-vm/asdf.git "$HOME/.asdf" --branch v0.14.0
    fi
    return 0
}

install_python_asdf() {
    if [[ ! -d "$HOME/.asdf" ]]; then
        warning "ASDF não está instalado"
        return 1
    fi

    source "$HOME/.asdf/asdf.sh" 2>/dev/null || true

    # Instala dependências para compilar Python
    if is_linux && command_exists apt-get; then
        sudo apt-get install -y \
            build-essential libssl-dev zlib1g-dev libbz2-dev \
            libreadline-dev libsqlite3-dev libncursesw5-dev \
            xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev
    fi

    # Adiciona plugin Python
    if ! asdf plugin list 2>/dev/null | grep -q "^python$"; then
        asdf plugin add python
    fi

    # Instala versões do Python
    local python_versions=("3.13.1" "3.12.8")
    for version in "${python_versions[@]}"; do
        if ! asdf list python 2>/dev/null | grep -q "$version"; then
            asdf install python "$version" || true
        fi
    done

    # Define versão global
    asdf global python "${python_versions[0]}" 2>/dev/null || true

    return 0
}

install_bun() {
    if command_exists brew; then
        brew install oven-sh/bun/bun
    else
        curl -fsSL https://bun.sh/install | bash
    fi
    return 0
}

install_ripgrep() {
    if command_exists brew; then
        brew install ripgrep
    elif is_linux && command_exists apt-get; then
        sudo apt-get install -y ripgrep
    fi
    return 0
}

category_devtools() {
    local items=(
        "FZF|Fuzzy finder para terminal"
        "ASDF|Gerenciador de versões multi-linguagem"
        "Python (via ASDF)|Múltiplas versões do Python"
        "Bun|Runtime JavaScript ultra-rápido"
        "Ripgrep|Busca rápida em arquivos"
    )

    show_selection_menu "DEV TOOLS - Selecione as ferramentas" "${items[@]}"

    for num in $MENU_SELECTION; do
        case $num in
            1) run_installation "FZF" install_fzf fzf ;;
            2) run_installation "ASDF" install_asdf asdf ;;
            3) run_installation "Python (ASDF)" install_python_asdf ;;
            4) run_installation "Bun" install_bun bun ;;
            5) run_installation "Ripgrep" install_ripgrep rg ;;
        esac
    done
}

# ══════════════════════════════════════════════════════════════
# CATEGORIA: DEVOPS/CLOUD
# ══════════════════════════════════════════════════════════════

install_docker() {
    if is_linux && command_exists apt-get; then
        sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
        sudo apt-get update
        sudo apt-get install -y ca-certificates curl gnupg lsb-release
        sudo mkdir -p /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
            sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
            sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        sudo usermod -aG docker "$USER"
        warning "Faça logout/login para usar Docker sem sudo"
    elif is_macos; then
        warning "No macOS, instale Docker Desktop: https://www.docker.com/products/docker-desktop"
        return 1
    fi
    return 0
}

install_aws_cli() {
    if command_exists brew; then
        brew install awscli
    elif is_linux; then
        local awscli_zip="/tmp/awscliv2.zip"
        curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "$awscli_zip"
        unzip -q "$awscli_zip" -d /tmp
        sudo /tmp/aws/install
        rm -rf /tmp/aws "$awscli_zip"
    fi
    return 0
}

install_kubectl() {
    if command_exists brew; then
        brew install kubectl
    elif is_linux && command_exists apt-get; then
        sudo apt-get install -y apt-transport-https ca-certificates curl gnupg
        curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.31/deb/Release.key | \
            sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
        echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.31/deb/ /' | \
            sudo tee /etc/apt/sources.list.d/kubernetes.list
        sudo apt-get update
        sudo apt-get install -y kubectl
    fi
    return 0
}

install_helm() {
    if command_exists brew; then
        brew install helm
    elif is_linux; then
        curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
    fi
    return 0
}

install_terraform() {
    if command_exists brew; then
        brew tap hashicorp/tap
        brew install hashicorp/tap/terraform
    elif is_linux && command_exists apt-get; then
        sudo apt-get install -y gnupg software-properties-common
        wget -O- https://apt.releases.hashicorp.com/gpg | \
            sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
        echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | \
            sudo tee /etc/apt/sources.list.d/hashicorp.list
        sudo apt-get update
        sudo apt-get install -y terraform
    fi
    return 0
}

category_devops() {
    local items=(
        "Docker|Containerização de aplicações"
        "AWS CLI|Interface de linha de comando AWS"
        "kubectl|CLI para Kubernetes"
        "Helm|Gerenciador de pacotes Kubernetes"
        "Terraform|Infraestrutura como código"
    )

    show_selection_menu "DEVOPS / CLOUD - Selecione as ferramentas" "${items[@]}"

    for num in $MENU_SELECTION; do
        case $num in
            1) run_installation "Docker" install_docker docker ;;
            2) run_installation "AWS CLI" install_aws_cli aws ;;
            3) run_installation "kubectl" install_kubectl kubectl ;;
            4) run_installation "Helm" install_helm helm ;;
            5) run_installation "Terraform" install_terraform terraform ;;
        esac
    done
}

# ══════════════════════════════════════════════════════════════
# CATEGORIA: MOBILE
# ══════════════════════════════════════════════════════════════

install_flutter() {
    if is_macos; then
        brew install --cask flutter
    elif is_linux; then
        if command_exists snap; then
            sudo snap install flutter --classic
        else
            local flutter_dir="$HOME/.flutter"
            if [[ ! -d "$flutter_dir" ]]; then
                git clone https://github.com/flutter/flutter.git -b stable "$flutter_dir"
            fi
        fi
    fi
    return 0
}

install_android_studio() {
    if is_macos; then
        brew install --cask android-studio
    elif is_linux; then
        if command_exists snap; then
            sudo snap install android-studio --classic
        fi
    fi
    return 0
}

category_mobile() {
    local items=(
        "Flutter|SDK para desenvolvimento multiplataforma"
        "Android Studio|IDE para desenvolvimento Android"
    )

    show_selection_menu "MOBILE - Selecione as ferramentas" "${items[@]}"

    for num in $MENU_SELECTION; do
        case $num in
            1) run_installation "Flutter" install_flutter flutter ;;
            2) run_installation "Android Studio" install_android_studio ;;
        esac
    done
}

# ══════════════════════════════════════════════════════════════
# CATEGORIA: BANCO DE DADOS
# ══════════════════════════════════════════════════════════════

install_dbeaver() {
    if command_exists brew; then
        brew install --cask dbeaver-community
    elif is_linux; then
        if command_exists snap; then
            sudo snap install dbeaver-ce --classic
        elif command_exists apt-get; then
            local dbeaver_deb="/tmp/dbeaver.deb"
            wget -O "$dbeaver_deb" "https://dbeaver.io/files/dbeaver-ce_latest_amd64.deb"
            sudo apt-get install -y "$dbeaver_deb"
            rm -f "$dbeaver_deb"
        fi
    fi
    return 0
}

install_apidog() {
    if command_exists brew; then
        brew install --cask apidog
    elif is_linux; then
        local apidog_url="https://assets.apidog.com/download/Apidog-linux-latest.tar.gz"
        local apidog_tar="/tmp/apidog.tar.gz"
        local apidog_dir="$HOME/.local/share/apidog"
        mkdir -p "$HOME/.local/bin" "$apidog_dir"
        wget -O "$apidog_tar" "$apidog_url"
        tar -xzf "$apidog_tar" -C "$apidog_dir"
        rm -f "$apidog_tar"
        ln -sf "$apidog_dir/Apidog" "$HOME/.local/bin/apidog"
    fi
    return 0
}

category_database() {
    local items=(
        "DBeaver|Cliente universal de banco de dados"
        "Apidog|Ferramenta de teste de APIs"
    )

    show_selection_menu "BANCO DE DADOS - Selecione as ferramentas" "${items[@]}"

    for num in $MENU_SELECTION; do
        case $num in
            1) run_installation "DBeaver" install_dbeaver dbeaver ;;
            2) run_installation "Apidog" install_apidog apidog ;;
        esac
    done
}

# ══════════════════════════════════════════════════════════════
# CONFIGURAÇÕES DO SISTEMA
# ══════════════════════════════════════════════════════════════

configure_gnome_settings() {
    if is_linux && command_exists gsettings; then
        # Desabilita sons do terminal
        gsettings set org.gnome.desktop.sound event-sounds false 2>/dev/null || true

        # Configura dock para auto-hide
        gsettings set org.gnome.shell.extensions.dash-to-dock autohide true 2>/dev/null || true
        gsettings set org.gnome.shell.extensions.dash-to-dock autohide-in-fullscreen true 2>/dev/null || true
    fi
}

configure_flameshot() {
    if is_linux && command_exists gsettings && command_exists flameshot; then
        # Desabilita atalhos padrão de screenshot do GNOME
        gsettings set org.gnome.shell.keybindings screenshot "[]" 2>/dev/null || true
        gsettings set org.gnome.shell.keybindings show-screenshot-ui "[]" 2>/dev/null || true

        # Configura Print Screen para Flameshot
        gsettings set org.gnome.settings-daemon.plugins.media-keys custom-keybindings \
            "['/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/']" 2>/dev/null || true
        gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/ \
            name 'Flameshot' 2>/dev/null || true
        gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/ \
            command 'flameshot gui' 2>/dev/null || true
        gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/ \
            binding 'Print' 2>/dev/null || true
    fi
}

# ══════════════════════════════════════════════════════════════
# EXPORTS (funções disponíveis para o bootstrap.sh)
# ══════════════════════════════════════════════════════════════

# As funções install_* e configure_* são chamadas diretamente pelo bootstrap.sh
