echo "Installing Campus Code Dotfiles"
echo "We'll install:"
echo "  - tmux"
echo "  - silver searcher"
echo "  - zsh"
echo "  - rvm"

echo "  - vim (vim-gnome)"

sudo apt update -y && sudo apt upgrade -y
sudo apt-get install -y software-properties-common gnupg2
gpg2 --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB

sudo apt-get install -y silversearcher-ag \
  zsh \
  git \
  tmux \
  peek \
  xclip \
  bison \
  vim-gtk3 \
  dconf-cli \
  pkg-config \
  gnupg-agent \
  ncurses-dev \
  libevent-dev \
  openfortivpn \
  brave-browser \
  build-essential \
  ca-certificates \
  apt-transport-https \
  software-properties-common

ubuntu.sh


fonts.sh

vim -N \"+set hidden\" \"+syntax on\" +PlugInstall +qall

git clone --depth=1 git://github.com/zsh-users/zsh-syntax-highlighting.git ~/.zsh-syntax-highlighting

