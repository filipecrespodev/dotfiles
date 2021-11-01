export ZSH=$HOME/.oh-my-zsh

# https://github.com/halfo/lambda-mod-zsh-theme
# ZSH_THEME="gozilla"
# ZSH_THEME="amuse"
ZSH_THEME="lambda-mod"
plugins=(git)

export LAMBDA_MOD_N_DIR_LEVELS=2

source $ZSH/oh-my-zsh.sh

# EDITOR
export VISUAL=vim
export EDITOR=$VISUAL

# ASDF
export PATH=$HOME/.asdf/shims:$PATH

. $HOME/.asdf/asdf.sh
. $HOME/.asdf/completions/asdf.bash

export ERL_AFLAGS="-kernel shell_history enabled"

source ~/.aliasesrc

[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh

export PATH="$HOME/.poetry/bin:$PATH"
