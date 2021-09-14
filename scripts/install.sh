#!/bin/bash

# In order to enable the extension debug logs, use this command:
#
# install.sh --enable-debug-log

SCRIPTS_FOLDER="$( dirname "$(realpath -s "$0")" )"

source $SCRIPTS_FOLDER/_vars.sh "$@"

echo "Calling the build script..."
$SCRIPTS_FOLDER/build.sh "$@"

build_exit_status=$?
if [ $build_exit_status -ne 0 ]; then exit $build_exit_status; fi

echo "Installing $EXTENSION_NAME extension to local extensions folder..."
gnome-extensions install --force $PACKAGE_FILE

if [ -n "${enable_debug_log+set}" ]; then
  echo "Enabling extension debug logs..."
  echo "debug = true;" >> "$EXTENSION_INSTALL_FOLDER"/config.js
fi

echo "Disabling $EXTENSION_NAME extension..."
gnome-extensions disable $EXTENSION_UUID

echo "Restarting gnome shell..."

restart_output=`busctl --user call org.gnome.Shell \
  /org/gnome/Shell org.gnome.Shell Eval s 'Meta.restart("Restarting...")'`

if [ "$restart_output" == 'bs true ""' ]; then echo "Restart completed.";
else echo "Restart output: $restart_output"; fi

echo "Enabling $EXTENSION_NAME extension..."
gnome-extensions enable $EXTENSION_UUID

if [[ $( gnome-extensions list --enabled | grep "$EXTENSION_UUID") = "$EXTENSION_UUID" ]] 
then echo "$EXTENSION_NAME extension was successfully installed!";
else echo "Error: Extension $EXTENSION_NAME is not enabled! Please check the journalctl logs."; fi
