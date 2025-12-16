#!/bin/bash

# Script para corrigir repositórios problemáticos

echo "Corrigindo repositórios..."

# Remove PPA do Alacritty que causa erro
echo "Removendo PPA problemático do Alacritty..."
sudo add-apt-repository --remove ppa:aslatter/ppa -y 2>/dev/null || true
sudo rm -f /etc/apt/sources.list.d/aslatter-ubuntu-ppa-*.list 2>/dev/null || true

# Atualiza lista de pacotes
echo "Atualizando repositórios..."
sudo apt-get update

echo ""
echo "✅ Repositórios corrigidos!"
echo ""
echo "Agora você pode executar novamente:"
echo "  ./bootstrap.sh"
