#!/bin/bash

add-apt-repository ppa:obsproject/obs-studio

apt install ffmpeg \
  v4l2loopback-dkms

apt update

apt install obs-studio

ln -s $PWD/live/twitch ~/.config/obs-studio/basic/profiles
ln -s $PWD/live/twitch.json ~/.config/obs-studio/basic/scenes/
