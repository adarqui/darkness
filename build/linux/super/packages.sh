#!/bin/sh

[ -n "$DARK_BUILD" ] || { echo "DARK_BUILD must be set"; exit 1; }

sudo apt-get update
sudo apt-get -y upgrade
sudo apt-get -y install build-essential
sudo apt-get -y install git tmux wget curl
sudo apt-get -y install xz-utils
sudo apt-get -y install tcpdump
sudo apt-get -y install strace gdb
sudo apt-get -y install whois host traceroute telnet
sudo apt-get -y install redis-server
sudo apt-get -y install pkg-config
