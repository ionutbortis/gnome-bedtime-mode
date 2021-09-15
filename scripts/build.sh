#!/bin/bash

SCRIPTS_FOLDER="$( dirname "$(realpath -s "$0")" )"

source $SCRIPTS_FOLDER/_vars.sh "$@"

pre_build_cleanup() {
  echo "Removing ui temp files and build folder..."

  rm -rf "$PROJECT_ROOT"/src/ui/*/preferences.ui~
  rm -rf "$BUILD_FOLDER" && mkdir -p "$BUILD_FOLDER"
}

create_package() {
  echo "Packing the extension..."

  gnome-extensions pack \
    --force \
    --extra-source=$PROJECT_ROOT/src/icons \
    --extra-source=$PROJECT_ROOT/src/modules \
    --extra-source=$PROJECT_ROOT/src/schemas \
    --extra-source=$PROJECT_ROOT/src/ui \
    --extra-source=$PROJECT_ROOT/src/config.js \
    --extra-source=$PROJECT_ROOT/src/utils.js \
    --podir=$PROJECT_ROOT/po \
    --gettext-domain=$EXTENSION_DOMAIN \
    --out-dir=$BUILD_FOLDER \
    $PROJECT_ROOT/src
}

rename_package() {
  mv "$BUILD_FOLDER"/"$EXTENSION_UUID".shell-extension.zip $PACKAGE_FILE

  echo "Package created: $PACKAGE_FILE"
}

pre_build_cleanup
create_package
rename_package
