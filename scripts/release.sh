#!/bin/bash

SCRIPTS_FOLDER="$( dirname "$(realpath -s "$0")" )"

source $SCRIPTS_FOLDER/_vars.sh "$@"

display_release_checklist() {
  echo
  echo "$EXTENSION_NAME extension release checklist 👀 :"
  echo
  echo "✔  Manual test the extension on all the supported Gnome versions."
  echo "✔  Check metadata.json description and increase the version number."
  echo "✔  Run scripts/languages.sh and check if new translations are needed."
  echo "✔  Update README.md install section to point to the new release version."
  echo "✔  Update README.md to include other relevant info, if needed."
  echo
}

display_release_checklist

read -n 1 -p "Ready for release? (y/n) " user_input
echo
if [ -n "${user_input+set}" ] && [ "$user_input" != "y" ]; then exit 1; fi

$SCRIPTS_FOLDER/install.sh --enable-debug-log "$@"
