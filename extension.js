"use strict";

const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const { logDebug } = Me.imports.utils;

const { Settings } = Me.imports.modules.Settings;
const { Bedtime } = Me.imports.modules.Bedtime;

var bedtime = null;
var settings = null;

function enable() {
  logDebug("Enabling extension...");

  settings = new Settings();
  bedtime = new Bedtime();

  settings.enable();
  bedtime.enable();

  logDebug("Extension enabled.");
}

function disable() {
  logDebug("Disabling extension...");

  bedtime.disable();
  settings.disable();

  bedtime = null;
  settings = null;

  logDebug("Extension disabled.");
}

function init() {
  logDebug("Initializing extension...");
  // TODO add translations init here
}
