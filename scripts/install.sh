#!/bin/bash

# In order to skip the metadata prompt when building the package
# and to enable the extension debug logs, use this command:
#
# install.sh --enable-debug-log --skip-metadata-prompt

SCRIPTS_FOLDER="$( dirname "$(realpath -s "$0")" )"

source $SCRIPTS_FOLDER/_vars.sh "$@"

echo "Calling the build script..."
$SCRIPTS_FOLDER/build.sh "$@"

build_exit_status=$?
if [ $build_exit_status -ne 0 ]; then exit $build_exit_status; fi

echo "Installing '$EXTENSION_NAME' extension to local extensions folder..."
gnome-extensions install --force $PACKAGE_FILE

if [ -n "${enable_debug_log+set}" ]; then
  echo "Enabling extension debug logs..."
  echo "debug = true;" >> "$EXTENSION_INSTALL_FOLDER"/config.js
fi

echo "Enabling '$EXTENSION_NAME' extension..."
gnome-extensions enable $EXTENSION_UUID

echo "Restarting gnome shell..."
killall -3 gnome-shell
