#!/bin/bash
# TODO Install VLC
# TODO Install Vsode
# TODO Install OBS Studio
# TODO Install TWAEKS
# TODO Install Peek


function update_upgrade(){
  echo 'Update and Upgrade'
  sudo apt update -y && sudo apt upgrade -y
}

update_upgrade

echo 'Add repositories'
sudo apt-get install -y software-properties-common gnupg2
gpg2 --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3   7D2BAF1CF37B13E2069D6956105BD0E739499BDB
curl -s https://brave-browser-apt-release.s3.brave.com/brave-core.asc | sudo apt-key --keyring /etc/apt/trusted.gpg.d/brave-browser-release.gpg add -
echo "deb [arch=amd64] https://brave-browser-apt-release.s3.brave.com/ stable main" | sudo tee /etc/apt/sources.list.d/brave-browser-release.list
sudo add-apt-repository "deb http://archive.ubuntu.com/ubuntu $(lsb_release -sc) universe"

update_upgrade

echo 'Install prograns: zsh, vim, git, tmux, xclip, bison, ripgrep, dconf-cli, pkg-config, gnupg-agent, ncurses-dev, libevent-dev, openfortivpn, brave-browser, fonts-firacode, build-essential, ca-certificates, silversearcher-ag, apt-transport-https, software-properties-common'

sudo apt-get install -y zsh \
  vim \
  git \
  tmux \
  xclip \
  bison \
  ripgrep \
  dconf-cli \
  pkg-config \
  gnupg-agent \
  ncurses-dev \
  libevent-dev \
  openfortivpn \
  brave-browser \
  fonts-firacode \
  build-essential \
  ca-certificates \
  silversearcher-ag \
  apt-transport-https \
  software-properties-common

echo 'Install plug vim'
curl -fLo ~/.vim/autoload/plug.vim --create-dirs \
  https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim

echo 'Install fzf'
git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf
~/.fzf/install

echo 'Install zsh-syntax-highlighting'
git clone --depth=1 git://github.com/zsh-users/zsh-syntax-highlighting.git ~/.zsh-syntax-highlighting

echo 'Install fonts'
git clone https://github.com/powerline/fonts.git --depth=1 ~/
~/fonts/install.sh

echo 'Remove sounds in terminal'
sudo gsettings set org.gnome.desktop.sound event-sounds false
gsettings set org.gnome.desktop.sound event-sounds false

echo 'Install oh-my-zsh'
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"

echo 'Install Asdf'
git clone https://github.com/asdf-vm/asdf.git ~/.asdf

echo 'Add Lambda Mod Theme'
wget -P ~/.oh-my-zsh/themes https://raw.githubusercontent.com/halfo/lambda-mod-zsh-theme/master/lambda-mod.zsh-theme

echo 'Install code'
wget -P ~/Download https://code.visualstudio.com/sha/download?build=stable&os=linux-deb-x64
cd ~/Download && apt install

echo 'Create my work dir'
mkdir -p ~/Workspace/My

echo 'Clone .dotfile project'
git clone git@github.com:filipecrespodev/dotfiles.git  ~/Workspace/My/

echo 'Run dotfiles'
cd ~/Workspace/My/dotfiles && ./setup.sh
