#!/bin/bash

# In order to enable the extension debug logs, use this command:
#
# ./install.sh --enable-debug-log

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

  echo "Please re-login and, if needed, manually enable the extension afterwards."
}

build_extension
install_extension
