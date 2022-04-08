"use strict";

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const { Preferences } = Me.imports.modules.Preferences;

function init() {
  ExtensionUtils.initTranslations();
}

function buildPrefsWidget() {
  const preferences = new Preferences();
  return preferences.widget;
}

// This is a temporary workaround in order to fix the Libadwaita
// nested GtkScrolledWindow issue on Gnome 42.
// The plan is to redesign the UI according to Libadwaita principles
// and support new features only for Gnome 42 and onward.
function fillPreferencesWindow(window) {
  const box = new imports.gi.Gtk.Box({
    orientation: imports.gi.Gtk.Orientation.VERTICAL,
  });
  box.append(new imports.gi.Adw.HeaderBar());
  box.append(buildPrefsWidget());
  window.set_content(box);
}
