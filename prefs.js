"use strict";

const { GLib, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const { utils } = Me.imports;
const { Preferences } = Me.imports.modules.Preferences;

/**
 * Initialize the preferences.
 */
function init() {
  //compat.initTranslations(Me.metadata.uuid);
  //const iconTheme = Gtk.IconTheme.get_default();
  //iconTheme.append_search_path(GLib.build_filenamev([Me.path, "icons"]));
}

/**
 * Build the preferences widget.
 */
function buildPrefsWidget() {
  const preferences = new Preferences();

  GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
    const window = preferences.widget.get_toplevel();
    //window.resize(600, 200);
    window.set_titlebar(preferences.headerbar);
  });

  return preferences.widget;
}
