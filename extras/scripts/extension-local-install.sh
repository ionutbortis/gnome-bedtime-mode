#!/bin/bash

EXTENSIONS_HOME=~/.local/share/gnome-shell/extensions

EXTENSION_UUID=gnomebedtime@ionutbortis.gmail.com

# Get the 'extension_debug' script param. Usage:
# ./extension-local-install.sh --extension_debug true
extension_debug=false

while [ $# -gt 0 ]; do
  if [[ $1 == *"--"* ]]; then
    param="${1/--/}"
    declare $param="$2"
  fi
  shift
done

echo "Installing Bedtime Mode extension to local extensions folder..."

rsync_exclusions=(
  --exclude ".git*"
  --exclude "extras"
)
my_extension_home=$EXTENSIONS_HOME/$EXTENSION_UUID

script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
source_code_root="$script_dir/../.."

# Compile the extension settings schemas
glib-compile-schemas $source_code_root/schemas/

# Replace the local extension with the one from the local github repo
rm -rf $my_extension_home && rsync -av "${rsync_exclusions[@]}" $source_code_root/* $my_extension_home

sleep 1s

# Turn on extension debug if the script 'extension_debug' param is true
if [[ $extension_debug == true ]]; then
  echo "Enabling extension debug. 'extension_debug' script param is: $extension_debug"
  echo "debug = true;" >> $my_extension_home/config.js
fi

# Disable the extension
gnome-extensions disable $EXTENSION_UUID

# Restart the gnome shell
killall -3 gnome-shell
sleep 5s

# Enable the extension
gnome-extensions enable $EXTENSION_UUID
