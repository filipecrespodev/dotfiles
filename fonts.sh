#!/bin/bash

echo "======================================================"
echo "Installing patched fonts for Powerline/Lightline."
echo "======================================================"

mkdir -p ~/.fonts

cp ~/.cc_dotfiles/fonts/* ~/.fonts

fc-cache -vf ~/.fonts
