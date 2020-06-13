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
rm -f ~/.config/Code/User/settings.json
ln -s vscode/settings.json ~/.config/Code/User/settings.json

source $bashrc_file

echo "done!"