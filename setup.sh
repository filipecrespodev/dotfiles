#!/bin/bash

export bashrc_file=~/.bashrc

dotfiles=$(ls -A dotfiles| egrep '^\.')
for i in $dotfiles
do
 rm -f ~/$i
 ln -s $PWD/dotfiles/$i ~/$i
done

grep bashrc_includes $bashrc_file || echo "source ~/.bashrc_includes" >> $bashrc_file

vscode/extension.sh
rm -f ~/.config/Code/User/settings.json
ln -s $PWD/vscode/settings.json ~/.config/Code/User/settings.json

source $bashrc_file

echo "done!"
