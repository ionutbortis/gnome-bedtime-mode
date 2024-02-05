"use strict";

import Adw from "gi://Adw";
import Gtk from "gi://Gtk";

import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

import { Preferences } from "./ui/Preferences.js";

export default class BedtimeModePreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const emptyPage = new Adw.PreferencesPage();
    emptyPage.add(new Adw.PreferencesGroup());
    window.add(emptyPage);

    const box = new Gtk.Box({
      orientation: Gtk.Orientation.VERTICAL,
    });
    box.append(new Adw.HeaderBar());
    box.append(new Preferences(this).widget);
    window.set_content(box);
  }

  get uiFile() {
    return `${this.path}/ui/preferences.ui`;
  }
}
