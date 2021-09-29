#!/bin/bash

# In order to enable the extension debug logs, use this command:
#
# install.sh --enable-debug-log

SCRIPTS_FOLDER="$( dirname "$(realpath -s "$0")" )"

source "$SCRIPTS_FOLDER/_vars.sh" "$@"

build_extension() {
  echo "Calling the build script..."
  "$SCRIPTS_FOLDER/build.sh" "$@"

  local build_exit_status=$?
  if [ $build_exit_status -ne 0 ]; then exit $build_exit_status; fi
}

install_extension() {
  echo "Installing $EXTENSION_NAME extension to local extensions folder..."
  gnome-extensions install --force "$PACKAGE_FILE"

  if [ -n "${enable_debug_log+set}" ]; then
    echo "Enabling extension debug logs..."
    echo "debug = true;" >> "$EXTENSION_INSTALL_FOLDER/config.js"
  fi
}

reload_extension() {
  echo "Disabling $EXTENSION_NAME extension..."
  gnome-extensions disable "$EXTENSION_UUID"

  echo "Restarting gnome shell..."
  pkill -3 gnome-shell
  sleep 5s

  echo "Enabling $EXTENSION_NAME extension..."
  gnome-extensions enable "$EXTENSION_UUID"
}

check_extension_status() {
  if [[ $( gnome-extensions list --enabled | grep "$EXTENSION_UUID") = "$EXTENSION_UUID" ]] 
  then echo "$EXTENSION_NAME extension was successfully installed!";
  else echo "ERROR: Extension $EXTENSION_NAME is not enabled! Please check the journalctl logs."; fi
}

build_extension
install_extension
reload_extension
check_extension_status
