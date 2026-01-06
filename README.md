# Dotfiles

Configurações pessoais de desenvolvimento para Linux/macOS. Scripts automatizados para configurar rapidamente um novo ambiente de desenvolvimento com ZSH, Vim, Tmux, Git, Docker, Zed Editor e mais.

## Características

- 🚀 **Instalação com um comando**: Execute e tenha seu ambiente pronto
- 🔧 **Modular**: Escolha o que instalar (minimal, standard, full ou custom)
- 🔄 **Idempotente**: Pode executar múltiplas vezes sem problemas
- 💾 **Backups automáticos**: Faz backup de configurações existentes
- 🎨 **Terminal bonito**: Oh-My-Zsh + Powerlevel10k ou Oh-My-Posh (você escolhe)
- 🔤 **Fontes modernas**: JetBrains Mono Nerd Font com ligatures
- ⚡ **Ferramentas modernas**: FZF, Ripgrep, ASDF, Zed Editor

## Instalação Rápida

### Instalação Local

Se você já clonou o repositório:

```bash
cd ~/Workspace/My/dotfiles
chmod +x bootstrap.sh
./bootstrap.sh
```

### Instalação Remota

Execute direto da internet (requer git e curl):

```bash
git clone https://github.com/filipecrespodev/dotfiles.git ~/dotfiles
cd ~/dotfiles
chmod +x bootstrap.sh
./bootstrap.sh
```

**Nota:** Se encontrar erros relacionados a repositórios durante a instalação, execute primeiro `./fix-repos.sh` e depois execute novamente o `./bootstrap.sh`.

## Modos de Instalação

Quando executar `./bootstrap.sh`, você poderá escolher:

1. **Minimal** - Apenas cria symlinks dos dotfiles
2. **Standard** - Pacotes essenciais + ferramentas de desenvolvimento + symlinks
3. **Full** - Instalação completa (recomendado para máquinas novas)
4. **Custom** - Escolha componente por componente

## O que será instalado?

### Pacotes Essenciais (Standard/Full)
- **Homebrew** - Package manager universal (macOS e Linux)
- Git, Curl, Wget, ZSH, Vim, Tmux
- Build tools (gcc, make, etc)
- Ripgrep, FZF, Silver Searcher
- JetBrains Mono Nerd Font (com ligatures)

### Ferramentas de Desenvolvimento (Standard/Full)

**Emulador de Terminal (você escolhe um):**
- **Alacritty** (Recomendado) - GPU-accelerated, ultra rápido, leve
- **Kitty** - GPU-accelerated, suporte a imagens, split panes nativo

**Theme Engine (você escolhe um):**
- **Oh-My-Zsh + Powerlevel10k** (Recomendado) - Stack mais popular e estável com tema altamente customizável
- **Oh-My-Posh** - Moderno, rápido e cross-platform com configuração em JSON

**Editores de Código (opcionais):**
- **Zed** - Editor moderno e ultra-rápido (Recomendado por padrão)
- **VSCode** - Editor mais popular, extensões ilimitadas
- **Cursor** - Fork do VSCode com IA integrada (Codex)
- **Claude Desktop** - Chat AI standalone

**Ferramentas incluídas:**
- **Homebrew** - Package manager universal (instalado primeiro)
- **ZSH Plugins** - syntax-highlighting, autosuggestions, completions
- **FZF** - Fuzzy finder para navegação rápida
- **ASDF** - Version manager (Node, Python, Go, etc)
- **Flameshot** - Ferramenta moderna de screenshot
- **Discord** - Comunicação e colaboração
- **Docker** (opcional) - Containerização

### Configurações (Todos os modos)
- `.zshrc` com aliases e funções úteis
- `.gitconfig` com aliases e configurações Git
- `.vimrc` com plugins e temas
- `.tmux.conf` com configurações personalizadas
- Theme engine configurado (Oh-My-Zsh + Powerlevel10k ou Oh-My-Posh)
- Configurações de terminal (Alacritty, Kitty) com JetBrains Mono Nerd Font

## Estrutura do Projeto

```
dotfiles/
├── bootstrap.sh              # Script principal - execute este!
├── fix-repos.sh             # Corrige problemas com repositórios (se necessário)
├── install/                  # Scripts de instalação
│   ├── packages.sh          # Pacotes do sistema
│   ├── development.sh       # Ferramentas de dev
│   ├── fonts.sh             # Instalação de fontes
│   └── symlinks.sh          # Cria symlinks dos dotfiles
├── config/                   # Configurações
│   ├── zsh/                 # ZSH, aliases, funções
│   ├── git/                 # Git config
│   ├── vim/                 # Vim config
│   ├── tmux/                # Tmux config
│   ├── alacritty/           # Alacritty config
│   ├── kitty/               # Kitty config
│   └── themes/              # Temas (oh-my-posh)
├── scripts/                  # Scripts utilitários
│   ├── utils.sh             # Funções compartilhadas
│   ├── configure-terminal-fonts.sh  # Configura fontes nos terminais
│   ├── set-default-terminal.sh      # Define terminal padrão do sistema
│   ├── configure-flameshot.sh       # Configura Flameshot e atalhos
│   ├── test-print-screen.sh         # Testa atalho Print Screen
│   └── test-setup.sh                # Verifica instalação completa
└── README.md                 # Este arquivo
```

## Homebrew - Package Manager

O Homebrew é instalado automaticamente como primeira etapa da instalação. É um package manager universal que funciona tanto em macOS quanto em Linux.

**Vantagens:**
- ✅ Mesmos comandos em macOS e Linux
- ✅ Pacotes sempre atualizados
- ✅ Fácil instalação de ferramentas de desenvolvimento
- ✅ Gerenciamento centralizado de dependências

**Instalação:**
- **macOS**: Instalado em `/opt/homebrew` ou `/usr/local`
- **Linux**: Instalado em `/home/linuxbrew/.linuxbrew` (Linuxbrew)

**Comandos úteis:**
```bash
brew install <package>      # Instala um pacote
brew update                 # Atualiza lista de pacotes
brew upgrade                # Atualiza todos os pacotes
brew search <name>          # Busca um pacote
brew list                   # Lista pacotes instalados
```

Após a instalação no Linux, o Homebrew é automaticamente configurado no seu `.zshrc`.

## Theme Engines para ZSH

Durante a instalação, você pode escolher entre dois theme engines:

### Oh-My-Zsh + Powerlevel10k (Recomendado)

**Vantagens:**
- ✅ Mais popular e amplamente testado
- ✅ Grande ecossistema de plugins e temas
- ✅ Powerlevel10k é extremamente customizável
- ✅ Configuração interativa com `p10k configure`
- ✅ Melhor documentação e suporte da comunidade

**Ideal para:**
- Usuários que querem estabilidade comprovada
- Quem prefere um ecossistema maduro de plugins
- Desenvolvedores que valorizam customização visual avançada

### Oh-My-Posh

**Vantagens:**
- ✅ Mais moderno e rápido
- ✅ Cross-platform (mesma config em Windows/macOS/Linux)
- ✅ Configuração via arquivo JSON simples
- ✅ Temas consistentes entre diferentes sistemas

**Ideal para:**
- Usuários que trabalham em múltiplos sistemas operacionais
- Quem prefere configuração declarativa (JSON)
- Desenvolvedores que valorizam performance e simplicidade

## Fontes

Este dotfiles usa **JetBrains Mono Nerd Font** com suporte a ligatures, que oferece:

- Ícones e símbolos especiais (Nerd Font)
- Ligatures para melhor legibilidade do código
- Excelente renderização em terminais
- Otimizada para programação

### Instalação da Fonte

A fonte é instalada automaticamente durante o setup completo, mas você pode instalá-la manualmente:

```bash
./install/fonts.sh
```

### Configuração nos Terminais

Após instalar a fonte, configure seu terminal:

```bash
./scripts/configure-terminal-fonts.sh
```

Este script configura automaticamente:
- GNOME Terminal
- Tilix
- Terminator

Para outros terminais, veja as instruções que o script exibe.

### Configurações Incluídas

Os arquivos de configuração já vêm com a fonte configurada:
- **Alacritty**: `~/.config/alacritty/alacritty.toml`
- **Kitty**: `~/.config/kitty/kitty.conf`

## Terminal Padrão

Durante a instalação, você pode configurar Alacritty ou Kitty como terminal padrão do sistema. Isso significa que:

- O atalho `Ctrl+Alt+T` abrirá o terminal escolhido
- Links e scripts que abrem terminal usarão o terminal configurado
- O comando `x-terminal-emulator` abrirá o terminal padrão

### Configurar Manualmente

Se quiser mudar o terminal padrão depois:

```bash
./scripts/set-default-terminal.sh
```

O script detecta automaticamente os terminais instalados e configura:
- **update-alternatives** (Debian/Ubuntu)
- **gsettings** (GNOME)
- **xdg-mime** (padrão universal)
- **Atalhos de teclado** (GNOME, XFCE)

### Suporte por Desktop Environment

- ✅ **GNOME**: Configuração completa (atalho Ctrl+Alt+T)
- ✅ **XFCE**: Configuração completa
- ✅ **KDE**: Via update-alternatives (configure atalho manualmente)
- ✅ **Outros**: Via xdg-mime

## Flameshot - Screenshot Tool

Ferramenta moderna e poderosa para captura de tela com anotações.

### Recursos

- 📸 Captura de área, tela inteira ou janela
- ✏️ Anotações (setas, texto, formas, pixelização)
- 📋 Copia automaticamente para clipboard
- 🎨 Tema Catppuccin Mocha (integrado com o terminal)
- ⌨️ Atalhos de teclado configurados

### Atalhos Configurados

Durante a instalação, os seguintes atalhos são configurados:

- `Print Screen` - Abre GUI do Flameshot (selecionar área)
- `Ctrl+Print Screen` - Screenshot da tela inteira (copia para clipboard)
- `Shift+Print Screen` - Abre menu de opções

### Configuração Manual

Se quiser reconfigurar ou instalar separadamente:

```bash
# Instalar Flameshot
sudo apt-get install flameshot

# Configurar atalhos e preferências
./scripts/configure-flameshot.sh

# Testar se Print Screen está funcionando
./scripts/test-print-screen.sh
```

### Localização dos Screenshots

Por padrão, os screenshots são salvos em:
- **Diretório**: `~/Pictures/Screenshots/`
- **Configuração**: `~/.config/flameshot/flameshot.ini`

### Comandos Úteis

```bash
flameshot gui              # Abre interface para captura
flameshot full -c          # Captura tela inteira e copia
flameshot screen -n 0      # Captura monitor específico
flameshot launcher         # Abre menu de opções
```

## Discord

O Discord é instalado automaticamente durante a instalação Standard/Full para facilitar comunicação e colaboração.

### Métodos de Instalação

**Linux:**
- Via **Snap** (preferencial) - Auto-atualiza automaticamente
- Via **.deb oficial** (fallback) - Se snap não estiver disponível

**macOS:**
- Via **Homebrew** - Instalação simplificada

### Instalação Manual

Se quiser instalar apenas o Discord:

```bash
# Linux (via snap)
sudo snap install discord

# Linux (via .deb)
wget -O /tmp/discord.deb "https://discord.com/api/download?platform=linux&format=deb"
sudo apt-get install /tmp/discord.deb

# macOS
brew install --cask discord
```

### Recursos

- 💬 Chat de voz, vídeo e texto
- 🎮 Integração com jogos
- 📺 Compartilhamento de tela
- 🔔 Notificações personalizáveis
- 🤖 Suporte a bots e integrações

## Principais Aliases

Após a instalação, você terá acesso a:

```bash
# Editores
z              # Abre Zed no diretório atual
c              # Abre VSCode no diretório atual
cur            # Abre Cursor no diretório atual
claude         # Abre Claude Desktop

# Navegação
work           # cd ~/Workspace/Work
my             # cd ~/Workspace/My

# Git
g              # git
gs             # git status
ga             # git add
gc             # git commit
gp             # git push
glog           # git log bonito

# Docker
d              # docker
dc             # docker-compose
dps            # docker ps
dex            # docker exec -it

# Python
vc             # Cria virtual environment
va             # Ativa virtual environment
```

## Funções Úteis

```bash
# Git
git_clean_merged_branches    # Limpa branches já mergeadas
gsu                          # Define upstream automaticamente
gcb <nome>                   # Cria branch e faz push

# Utilitários
mkcd <dir>                   # Cria diretório e entra nele
extract <arquivo>            # Extrai arquivos compactados
fh                           # Busca no histórico com fzf
fd                           # Navega diretórios com fzf
```

## Personalização

Depois de instalar, você pode personalizar:

1. **Prompt ZSH**:
   - **Powerlevel10k**: Execute `p10k configure` para configuração interativa
   - **Oh-My-Posh**: Edite `~/config/themes/oh-my-posh.json`
2. **Aliases**: Edite `~/.aliases.zsh`
3. **Funções**: Edite `~/.functions.zsh`
4. **Git**: Edite `~/.gitconfig`
5. **Fontes dos terminais**: Execute `./scripts/configure-terminal-fonts.sh`

## Instalação Manual de Componentes

Se preferir instalar componentes separadamente:

```bash
# Instalar apenas fontes
./install/fonts.sh

# Configurar fontes nos terminais
./scripts/configure-terminal-fonts.sh

# Configurar terminal padrão (Ctrl+Alt+T)
./scripts/set-default-terminal.sh

# Configurar Flameshot
./scripts/configure-flameshot.sh

# Criar apenas symlinks
./install/symlinks.sh
```

## Desinstalação

Para remover os symlinks:

```bash
rm ~/.zshrc ~/.gitconfig ~/.vimrc ~/.tmux.conf ~/.tmux.conf.local
rm ~/.aliases.zsh ~/.functions.zsh
rm -rf ~/config/themes
```

## Compatibilidade

- ✅ Ubuntu 20.04+
- ✅ Debian 11+
- ✅ macOS 12+
- ⚠️  Outras distribuições Linux podem funcionar mas não foram testadas

## Requisitos Mínimos

- Git
- Curl
- Permissões de sudo (para instalar pacotes)

## Verificar Instalação

Para verificar se tudo foi instalado corretamente:

```bash
./scripts/test-setup.sh
```

Este script verifica:
- ✓ ZSH e shell padrão
- ✓ Theme engine (Oh-My-Zsh + Powerlevel10k ou Oh-My-Posh)
- ✓ JetBrains Mono Nerd Font
- ✓ Terminais (Alacritty/Kitty) e configurações
- ✓ Terminal padrão do sistema
- ✓ Flameshot e atalhos configurados
- ✓ Symlinks dos dotfiles
- ✓ Plugins ZSH
- ✓ Ferramentas essenciais

## Troubleshooting

### Erro em repositórios do sistema
Se você encontrar erros relacionados a repositórios (como PPAs problemáticos):
```bash
./fix-repos.sh
```
Este script corrige problemas comuns com repositórios e atualiza a lista de pacotes.

### ZSH não é o shell padrão
```bash
chsh -s $(which zsh)
```
Faça logout e login novamente.

### Fontes não aparecem corretamente
Execute o script de instalação de fontes:
```bash
./install/fonts.sh
./scripts/configure-terminal-fonts.sh
```
Depois reinicie seu terminal.

### Ctrl+Alt+T não abre o terminal correto
```bash
./scripts/set-default-terminal.sh
```
Selecione o terminal desejado e faça logout/login novamente.

### Print Screen não funciona com Flameshot
```bash
# Reconfigure os atalhos
./scripts/configure-flameshot.sh

# Faça logout/login novamente
```

Se o problema persistir, verifique conflitos:

**GNOME:**
```bash
gsettings list-recursively org.gnome.settings-daemon.plugins.media-keys | grep screenshot
```

**XFCE:**
```bash
xfconf-query -c xfce4-keyboard-shortcuts -l | grep -i print
```

**KDE:**
Vá em System Settings > Shortcuts e verifique se há conflitos com Spectacle.

### Comandos Docker precisam de sudo
```bash
sudo usermod -aG docker $USER
```
Faça logout e login novamente.

## Contribuindo

Sinta-se livre para abrir issues ou pull requests com melhorias!

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2020-present, Filipe Crespo
