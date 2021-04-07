#!/bin/bash

read  -n 1 -p "Did you prepare the metadata.json file? (y/n) " user_input
echo
if [[ $user_input == "n" ]]; then exit 0; fi

usage="./create-release-package.sh [version] [dest_folder]"
if [ $# -lt 2 ]; then
    echo "Invalid number of arguments! Script usage:"
    echo $usage
    exit 1
fi
version="$1"
dest_folder="$2"

SOURCE_CODE_ROOT=~/work/java/projects/gnome-bedtime
zip_exclusions=(
  --exclude='*.git*'
  --exclude='*extras/*'
  --exclude='*ui/preferences.ui~'
)
name_prefix=gnome-bedtime

echo "Compiling the extension settings schemas..."
glib-compile-schemas $SOURCE_CODE_ROOT/schemas/

rm -f "$dest_folder"/"$name_prefix"*.zip

package_file="$dest_folder"/"$name_prefix"_"$version".zip

echo "Creating release package: $package_file"
cd $SOURCE_CODE_ROOT && zip -r "${zip_exclusions[@]}" $package_file .

echo "Installing package to local extensions folder..."
my_extension_home=~/.local/share/gnome-shell/extensions/gnomebedtime@ionutbortis.gmail.com
rm -rf $my_extension_home/* && unzip -q $package_file -d $my_extension_home

echo "Done. Hit ALT+F2 and type 'r' to restart the gnome shell and check that extension works properly."
