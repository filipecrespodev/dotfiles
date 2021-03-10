#/bin/bash

add-apt-repository ppa:gnome-terminator
add-apt-repository ppa:peek-developers/stable

curl -s https://brave-browser-apt-release.s3.brave.com/brave-core.asc | sudo apt-key --keyring /etc/apt/trusted.gpg.d/brave-browser-release.gpg add -
echo "deb [arch=amd64] https://brave-browser-apt-release.s3.brave.com/ stable main" | sudo tee /etc/apt/sources.list.d/brave-browser-release.list

apt update -y && apt upgrade -y

apt install curl \
vim \
zsh \
terminator \
peek \
apt-transport-https \
openfortivpn \
ca-certificates \
gnupg-agent \
software-properties-common \
brave-browser \
tmux

# disable sound in terinal
sudo gsettings set org.gnome.desktop.sound event-sounds false
gsettings set org.gnome.desktop.sound event-sounds false

# https://github.com/powerline/powerline/raw/develop/font/PowerlineSymbols.otf
mv 'SomeFont for Powerline.otf' ~/.local/share/fonts/

# clone
git clone https://github.com/powerline/fonts.git --depth=1
# install
cd fonts
./install.sh
# clean-up a bit
cd ..
rm -rf fonts

