export ZSH=$HOME/.oh-my-zsh

# https://github.com/halfo/lambda-mod-zsh-theme
# ZSH_THEME="lambda-mod"

ZSH_THEME="spaceship"
SPACESHIP_PROMPT_PREFIXES_SHOW=true
SPACESHIP_PROMPT_SUFFIXES_SHOW=true
SPACESHIP_PACKAGE_SHOW=false
SPACESHIP_DOCKER_SHOW=false
SPACESHIP_HG_SHOW=false
SPACESHIP_HG_BRANCH_SHOW=false
SPACESHIP_HG_STATUS_SHOW=false
SPACESHIP_PACKAGE_SHOW=false
SPACESHIP_NODE_SHOW=false
SPACESHIP_RUBY_SHOW=false
SPACESHIP_ELM_SHOW=false
SPACESHIP_ELIXIR_SHOW=false
SPACESHIP_XCODE_SHOW_LOCAL=false
SPACESHIP_SWIFT_SHOW_LOCAL=false

SPACESHIP_PROMPT_ORDER=(
  time          # Time stamps section
  user          # Username section
  dir           # Current directory section
  host          # Hostname section
  git           # Git section (git_branch + git_status)
  pyenv         # Pyenv section
  kubectl       # Kubectl context section
  line_sep      # Line break
  vi_mode       # Vi-mode indicator
  jobs          # Background jobs indicator
  exit_code     # Exit code section
  char          # Prompt character
)

plugins=(git)
source $ZSH/oh-my-zsh.sh

# EDITOR

export VISUAL=vim
export EDITOR=$VISUAL

# ASDF

export PATH=$HOME/.asdf/shims:$PATH

. $HOME/.asdf/asdf.sh
. $HOME/.asdf/completions/asdf.bash

# Erlang/Elixir IEx history

export ERL_AFLAGS="-kernel shell_history enabled"

source ~/.aliasesrc
