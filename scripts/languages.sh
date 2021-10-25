#!/bin/bash

# Run this script without any arguments in order to update the 
# extension POT file and the existing translation PO files.
#
# To create a new translation file (locale_code.po) use this:
#
# ./languages.sh --new-locale=desired_locale_code

SCRIPTS_FOLDER="$( dirname "$(realpath -s "$0")" )"

source "$SCRIPTS_FOLDER/_vars.sh" "$@"

PO_FOLDER="$PROJECT_ROOT/po"
EXTENSION_POT_FILE="$PO_FOLDER/$EXTENSION_DOMAIN.pot"

cd "$PROJECT_ROOT" || { echo "ERROR: Failed to cd to project root!"; exit 1; }

check_gettext_package_availability() {
  if ! command -v xgettext &> /dev/null; then
    echo "ERROR: Could not find xgettext! Please ensure the 'gettext' package is installed."
    exit 1
  fi
}

create_new_translation_file() {
  local new_translation_file="$PO_FOLDER"/"$new_locale".po

  if [ -f "$new_translation_file" ]; then 
    echo "A translation file for '$new_locale' already exists!"
    exit 1
  fi

  echo "Creating new translation file for locale '$new_locale'..."
  msginit \
      --input="$EXTENSION_POT_FILE" \
      --locale="$new_locale" \
      --output-file="$new_translation_file"

  exit 0
}

generate_extension_pot_file() {
  echo "Generating extension POT file..."

  xgettext \
      --from-code=UTF-8 \
      --package-name="$PACKAGE_NAME_PREFIX" \
      --package-version="$EXTENSION_VERSION" \
      --msgid-bugs-address="$MY_EMAIL_ADDRESS" \
      --output="$EXTENSION_POT_FILE" \
      ./src/*.js ./src/**/*.js ./src/ui/**/*.ui

  echo "Replacing charset line in order to use UTF-8..."
  sed -i '17s/.*/"Content-Type: text\/plain; charset=UTF-8\\n"/' "$EXTENSION_POT_FILE"

  echo "Extension POT file: $EXTENSION_POT_FILE"
}

update_translations_po_files() {
  for file in "$PO_FOLDER"/*.po
  do
    echo -n "Updating $(basename "$file")"
    msgmerge -U "$file" "$EXTENSION_POT_FILE"

    if grep --silent "#, fuzzy" "$file"; then
      fuzzy+=("$(basename "$file")")
    fi
  done

  if [[ -v fuzzy ]]; then
    echo "WARNING: Some translations have unclear strings and need update: ${fuzzy[*]}"
  fi
}

check_gettext_package_availability

[ -n "$new_locale" ] && create_new_translation_file
generate_extension_pot_file
update_translations_po_files
