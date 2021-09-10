#!/bin/bash

# In order to skip the metadata prompt when creating the release package
# and to enable the extension debug logs, use this command:
#
# extension-local-install.sh --enable_extension_debug --skip_metadata_prompt

source common-vars.sh "$@"

echo "Calling the create release package script..."
$PROJECT_ROOT/scripts/create-release-package.sh "$@"

echo "Installing '$EXTENSION_NAME' extension to local extensions folder..."
gnome-extensions install --force $PACKAGE_FILE

if [ ! -v ${enable_extension_debug} ]; then
  echo "Enabling extension debug logs..."
  echo "debug = true;" >> $MY_EXTENSION_HOME/config.js
fi

echo "Disabling '$EXTENSION_NAME' extension..."
gnome-extensions disable $EXTENSION_UUID

echo "Restarting gnome shell..."
killall -3 gnome-shell
sleep 5s

echo "Enabling '$EXTENSION_NAME' extension..."
gnome-extensions enable $EXTENSION_UUID
