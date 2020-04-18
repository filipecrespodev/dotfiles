#!/bin/bash

export bashrc_file=~/.bashrc

dotfiles=$(ls -A dotfiles| egrep '^\.')
for i in $dotfiles
do
  ln -s $PWD/dotfiles/$i ~/$i
done

grep bashrc_includes $bashrc_file || echo "source ~/.bashrc_includes" >> $bashrc_file

# vscode
vscode/extension.sh
ln -s vscode/settings.json > ~/.config/Code/User/settings.json

# TODO: colocar esse script no /usr/sbin/request_with_ticket para ficar global na maquina

source $bashrc_file

echo "done!"