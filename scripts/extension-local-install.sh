#!/bin/bash

# In order to skip the metadata prompt when creating the release package
# and to enable the extension debug logs, use this command:
#
# extension-local-install.sh --enable_extension_debug --skip_metadata_prompt

SCRIPTS_FOLDER="$(dirname "$(realpath -s "$0")")"

source $SCRIPTS_FOLDER/common-vars.sh "$@"

echo "Calling the create release package script..."
$SCRIPTS_FOLDER/create-release-package.sh "$@"

create_exit_status=$?
if [ $create_exit_status -ne 0 ]; then exit $create_exit_status; fi

echo "Installing '$EXTENSION_NAME' extension to local extensions folder..."
gnome-extensions install --force $PACKAGE_FILE

if [ ! -v ${enable_extension_debug} ]; then
  echo "Enabling extension debug logs..."
  echo "debug = true;" >> "$EXTENSION_INSTALL_FOLDER"/config.js
fi

echo "Disabling '$EXTENSION_NAME' extension..."
gnome-extensions disable $EXTENSION_UUID

echo "Restarting gnome shell..."
killall -3 gnome-shell
sleep 5s

echo "Enabling '$EXTENSION_NAME' extension..."
gnome-extensions enable $EXTENSION_UUID
