#!/bin/bash

apt update -y && apt upgrade -y

# VPN
apt install openfortivpn

# Vim plug
curl -fLo ~/.vim/autoload/plug.vim --create-dirs \
    https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim

