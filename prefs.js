"use strict";

const { extensionUtils } = imports.misc;
const Me = extensionUtils.getCurrentExtension();

const { Preferences } = Me.imports.modules.Preferences;

function init() {}

function buildPrefsWidget() {
  const preferences = new Preferences();
  return preferences.widget;
}
