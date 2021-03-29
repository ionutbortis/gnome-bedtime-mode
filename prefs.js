"use strict";

const { GLib, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const { utils } = Me.imports;
const { Preferences } = Me.imports.modules.Preferences;

function init() {}

function buildPrefsWidget() {
  const preferences = new Preferences();
  return preferences.widget;
}
