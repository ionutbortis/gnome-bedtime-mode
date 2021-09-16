#!/bin/bash

# Script arguments prefixed with -- are transformed into script variables
# (The -- prefix is stripped and dashes are replaced with underscores)
# 
# --new-locale=ro => $new_locale=ro
# --enable-debug-log => $enable_debug_log

while [ $# -gt 0 ]; do
  if [[ $1 == *"--"* ]]; then
    argument_split=(${1/=/ })

    var_name=$( echo ${argument_split[0]/--/} | tr '-' '_' ) 
    var_value=${argument_split[1]}

    declare $var_name=$var_value
  fi
  shift
done

MY_EMAIL_ADDRESS=ionutbortis@gmail.com

SCRIPTS_FOLDER="$( dirname "$(realpath -s "$0")" )"
PROJECT_ROOT="$( dirname "$SCRIPTS_FOLDER" )"
BUILD_FOLDER="$PROJECT_ROOT"/build

EXTENSION_METADATA_JSON_FILE="$PROJECT_ROOT"/src/metadata.json

get_extension_metadata_json_value() {
  echo $( cat $EXTENSION_METADATA_JSON_FILE | \
          python3 -c "import sys, json; print(json.load(sys.stdin)['$1'])" )
}
EXTENSION_NAME="$( get_extension_metadata_json_value 'name' )"
EXTENSION_UUID="$( get_extension_metadata_json_value 'uuid' )"
EXTENSION_DOMAIN="$( get_extension_metadata_json_value 'gettext-domain' )"
EXTENSION_VERSION="$( get_extension_metadata_json_value 'version' )"
EXTENSION_URL="$( get_extension_metadata_json_value 'url' )"
EXTENSION_SHELL_VERSIONS="$(get_extension_metadata_json_value 'shell-version' )"
SUPPORTED_GNOME_VERSIONS=${EXTENSION_SHELL_VERSIONS:1:-1}

PACKAGE_NAME_PREFIX=${EXTENSION_URL##*/}

PACKAGE_FILE="$BUILD_FOLDER"/"$PACKAGE_NAME_PREFIX"_"$EXTENSION_VERSION".0.zip

EXTENSION_INSTALL_FOLDER=~/.local/share/gnome-shell/extensions/"$EXTENSION_UUID"
