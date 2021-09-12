#!/bin/bash

# To create a new translation file (locale_code.po) use this:
#
# languages.sh --new-locale=desired_locale_code

SCRIPTS_FOLDER="$( dirname "$(realpath -s "$0")" )"

source $SCRIPTS_FOLDER/_vars.sh "$@"

PO_FOLDER="$PROJECT_ROOT"/po
EXTENSION_POT_FILE="$PO_FOLDER"/"$EXTENSION_DOMAIN".pot

cd "$PROJECT_ROOT"

if [ -n "$new_locale" ]; then
  NEW_TRANSLATION_FILE="$PO_FOLDER"/"$new_locale".po

  if [ -f "$NEW_TRANSLATION_FILE" ]; then 
    echo "A translation file for '$new_locale' already exists!"
    exit 1
  fi

  echo "Creating new translation file for locale '"$new_locale"'..."
  msginit \
      --input="$EXTENSION_POT_FILE" \
      --locale="$new_locale" \
      --output-file="$NEW_TRANSLATION_FILE"

  exit 0
fi

echo "Generating extension POT file..."
xgettext \
    --from-code=UTF-8 \
    --files-from="$PO_FOLDER"/POTFILES \
    --output="$EXTENSION_POT_FILE"

echo "Replacing charset line in order to use UTF-8..."
sed -i '17s/.*/"Content-Type: text\/plain; charset=UTF-8\\n"/' "$EXTENSION_POT_FILE"

echo "Extension POT file: $EXTENSION_POT_FILE"

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
