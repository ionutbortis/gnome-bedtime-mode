#!/bin/bash

# Script arguments prefixed with -- are transformed into script variables
# (The -- prefix is stripped and dashes are replaced with underscores)
# 
# --new-locale=ro => $new_locale=ro
# --skip-metadata-prompt => $skip_metadata_prompt

while [ $# -gt 0 ]; do
  if [[ $1 == *"--"* ]]; then
    parts=(${1/=/ })
    name=$( echo ${parts[0]/--/} | tr '-' '_' ) 
    value=${parts[1]}

    declare $name=$value
  fi
  shift
done

SCRIPTS_FOLDER="$( dirname "$(realpath -s "$0")" )"
PROJECT_ROOT="$( dirname "$SCRIPTS_FOLDER" )"
BUILD_FOLDER="$PROJECT_ROOT"/build

get_extension_metadata_json_value() {
  echo $( cat $PROJECT_ROOT/src/metadata.json | \
          python3 -c "import sys, json; print(json.load(sys.stdin)['$1'])" )
}
EXTENSION_NAME="$( get_extension_metadata_json_value 'name' )"
EXTENSION_UUID="$( get_extension_metadata_json_value 'uuid' )"
EXTENSION_DOMAIN="$( get_extension_metadata_json_value 'gettext-domain' )"
EXTENSION_VERSION="$( get_extension_metadata_json_value 'version' )"
EXTENSION_URL="$( get_extension_metadata_json_value 'url' )"

PACKAGE_NAME_PREFIX=${EXTENSION_URL##*/}

PACKAGE_FILE="$BUILD_FOLDER"/"$PACKAGE_NAME_PREFIX"_"$EXTENSION_VERSION".zip

EXTENSION_INSTALL_FOLDER=~/.local/share/gnome-shell/extensions/"$EXTENSION_UUID"
