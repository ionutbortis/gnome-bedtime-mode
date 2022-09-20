#!/bin/bash
set -e

SCRIPTS_FOLDER="$( dirname "$(realpath -s "$0")" )"

source "$SCRIPTS_FOLDER/_vars.sh" "$@"

display_release_checklist() {
  echo
  echo "$EXTENSION_NAME extension release checklist 👀 :"
  echo
  echo " ✔ Manual test the extension on Gnome versions $SUPPORTED_GNOME_VERSIONS. 👈"
  echo " ✔ Check '${EXTENSION_DESCRIPTION_FILE#${PROJECT_ROOT}/}' file for possible text updates."
  echo " ✔ Update 'README.md' to include relevant new info, if needed."
  echo " ✔ Check if new translations are needed."
  echo
  echo "📌 After script run check the changes to 'metadata.json' and 'README.md' files 📌"
  echo
}

prompt_user() {
  read -rn 1 -p "Ready for release? (y/n) " user_input
  echo
  if [ -n "${user_input+set}" ] && [ "$user_input" != "y" ]; then exit 1; fi
}

replace_line_in_file() {
  local file=$1; local line_index=$(($2-1)); local replacement_line=$3

  local python_command=(
      "import sys; f=open('$file', 'r+');"
      "lines = f.readlines(); lines[$line_index]=sys.stdin.read();"
      "f.seek(0); f.writelines(lines); f.truncate()" )

  echo "$replacement_line" | python3 -c "${python_command[*]}" 
}

compute_new_release_version() {
  local latest_git_tag=$(git tag --list --sort=version:refname 'v*' | tail -1)

  CURRENT_RELEASE_VERSION=$(echo "$latest_git_tag" | sed -r 's/v([0-9]*).*/\1/g')
  
  NEW_RELEASE_VERSION="$((CURRENT_RELEASE_VERSION+1))"

  echo "Release version found on github: $CURRENT_RELEASE_VERSION (tag '$latest_git_tag')"
  echo "New release version is: $NEW_RELEASE_VERSION"
}

update_extension_metadata_version() {
  echo "Updating extension metadata version..."

  local version_json_line="  \"version\": $NEW_RELEASE_VERSION"
  replace_line_in_file "$EXTENSION_METADATA_JSON_FILE" 12 "$version_json_line"
}

update_extension_metadata_description() {
  echo "Updating extension metadata description..."
  
  local description_temp_file=$(mktemp)

  cp "$EXTENSION_DESCRIPTION_FILE" "$description_temp_file"

  sed -i '/^#/d' "$description_temp_file"

  local description_text=$(sed 's/$/\\n/' "$description_temp_file" | tr -d '\n')
  local description_json_line="  \"description\": \"${description_text}\","

  replace_line_in_file "$EXTENSION_METADATA_JSON_FILE" 2 "$description_json_line" 

  rm "$description_temp_file"
}

update_readme_with_new_release_version() {
  echo "Updating README.md with the new release version..."

  local readme_file="$PROJECT_ROOT/README.md"
  sed -i 's/v'"$CURRENT_RELEASE_VERSION"'\.0/v'"$NEW_RELEASE_VERSION"'\.0/g' "$readme_file"
  sed -i 's/'"$CURRENT_RELEASE_VERSION"'\.0\.zip/'"$NEW_RELEASE_VERSION"'\.0\.zip/g' "$readme_file"
}

check_translations() {
  echo "Checking translations..."
  "$SCRIPTS_FOLDER/languages.sh"
}

build_and_install_extension() {
  "$SCRIPTS_FOLDER/install.sh" --enable-debug-log
}

display_release_checklist
prompt_user

compute_new_release_version
update_extension_metadata_version
update_extension_metadata_description
update_readme_with_new_release_version
check_translations

build_and_install_extension
