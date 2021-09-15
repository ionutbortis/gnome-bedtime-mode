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
