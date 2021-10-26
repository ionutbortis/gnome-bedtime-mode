#!/bin/bash

SCRIPTS_FOLDER="$( dirname "$(realpath -s "$0")" )"

source "$SCRIPTS_FOLDER/_vars.sh" "$@"

GTK3_UI_FILE="$PROJECT_ROOT/src/ui/gtk3/preferences.ui"
GTK4_UI_FILE="$PROJECT_ROOT/src/ui/gtk4/preferences.ui"

check_gtk4_tools_availability() {
  if ! command -v gtk4-builder-tool &> /dev/null; then
    echo "ERROR: Could not find the 'gtk4-builder-tool' command!"
    echo "Please ensure the 'gtk4-devel' package is installed."
    exit 1
  fi
}

convert_to_gtk4_format() {
  echo "Calling gtk4-builder-tool for 3 to 4 conversion..."

  gtk4-builder-tool simplify --3to4 "$GTK3_UI_FILE" > "$GTK4_UI_FILE"
}

convert_to_max_width_chars() {
  echo "Converting 'max-length' properties to 'max-width-chars'..."

  sed -i 's/<property name="max-length">/<property name="max-width-chars">/g' "$GTK4_UI_FILE"
}

remove_can_focus_properties() {
  echo "Removing 'can-focus' properties..."

  sed -i '/<property name="can-focus">0<\/property>/d' "$GTK4_UI_FILE"
}

remove_empty_lines() {
  echo "Removing empty lines..."

  sed -i '/^\s*$/d' "$GTK4_UI_FILE"
}

check_gtk4_tools_availability
convert_to_gtk4_format
convert_to_max_width_chars
remove_can_focus_properties
remove_empty_lines
