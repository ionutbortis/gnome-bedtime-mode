#!/bin/bash

while [ $# -gt 0 ]; do
  if [[ $1 == *"--"* ]]; then
    param="${1/--/}"
    declare $param="$2"
  fi
  shift
done

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$( cd $SCRIPT_DIR/.. &> /dev/null && pwd )"

getExtensionMetadataJsonValue() {
  echo $( cat $PROJECT_ROOT/src/metadata.json | \
          python3 -c "import sys, json; print(json.load(sys.stdin)['$1'])" )
}
EXTENSION_NAME="$(getExtensionMetadataJsonValue 'name')"
EXTENSION_UUID="$(getExtensionMetadataJsonValue 'uuid')"
EXTENSION_DOMAIN="$(getExtensionMetadataJsonValue 'gettext-domain')"
EXTENSION_VERSION="$(getExtensionMetadataJsonValue 'version')"
EXTENSION_URL="$(getExtensionMetadataJsonValue 'url')"

PACKAGE_NAME_PREFIX=${EXTENSION_URL##*/}

PACKAGE_FILE="$PROJECT_ROOT"/"$PACKAGE_NAME_PREFIX"_"$EXTENSION_VERSION".zip

EXTENSIONS_HOME=~/.local/share/gnome-shell/extensions

MY_EXTENSION_HOME=$EXTENSIONS_HOME/$EXTENSION_UUID
