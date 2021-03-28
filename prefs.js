"use strict";

const { GLib, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const { utils } = Me.imports;
const { Preferences } = Me.imports.modules.Preferences;

function init() {
  //compat.initTranslations(Me.metadata.uuid);
  //const iconTheme = Gtk.IconTheme.get_default();
  //iconTheme.append_search_path(GLib.build_filenamev([Me.path, "icons"]));
}

function buildPrefsWidget() {
  const preferences = new Preferences();
  return preferences.widget;
}
