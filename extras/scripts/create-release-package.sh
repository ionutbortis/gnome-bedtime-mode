#!/bin/bash

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
package_name=gnome-bedtime

cd $SOURCE_CODE_ROOT && rm -f $package_name*.zip

zip -r "${zip_exclusions[@]}" $dest_folder/"$package_name"_"$version".zip .
