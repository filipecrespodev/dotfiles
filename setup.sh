#!/bin/bash

export bashrc_file=~/.bashrc

dotfiles=$(ls -A dotfiles| egrep '^\.')
for i in $dotfiles
do
  ln -s $PWD/dotfiles/$i ~/$i
done

grep bashrc_includes $bashrc_file || echo "source ~/.bashrc_includes" >> $bashrc_file

export vssettings_file=~/.config/Code/User/settings.json

cat vscode/settings.json >> vssettings_file

vscode/extension.sh

source $bashrc_file

echo "done!"