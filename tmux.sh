#!/bin/bash

TMUX_VERSION="3.1b"
TMUX_SOURCE_FILE="tmux-${TMUX_VERSION}.tar.gz"
TMUX_SOURCE_FOLDER="tmux-${TMUX_VERSION}"

echo "Installing tmux ${TMUX_VERSION}"
wget https://github.com/tmux/tmux/releases/download/${TMUX_VERSION}/${TMUX_SOURCE_FILE}
tar -xf ${TMUX_SOURCE_FILE}
pushd $TMUX_SOURCE_FOLDER
./configure
make
sudo make install
popd
rm -rf $TMUX_SOURCE_FOLDER
rm $TMUX_SOURCE_FILE
