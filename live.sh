#!/bin/bash

sudo add-apt-repository ppa:obsproject/obs-studio

sudo apt install ffmpeg \
  v4l2loopback-dkms

sudo apt update

sudo apt install obs-studio
