"use strict";

const { extensionUtils } = imports.misc;
const Me = extensionUtils.getCurrentExtension();

const { logDebug } = Me.imports.utils;

const { Settings } = Me.imports.modules.Settings;
const { Scheduler } = Me.imports.modules.Scheduler;
const { Decorator } = Me.imports.modules.Decorator;
const { Colorizer } = Me.imports.modules.Colorizer;

var settings = null;
var scheduler = null;
var decorator = null;
var colorizer = null;

function enable() {
  logDebug("Enabling extension...");

  settings = new Settings();
  scheduler = new Scheduler();
  decorator = new Decorator();
  colorizer = new Colorizer();

  settings.enable();
  scheduler.enable();
  decorator.enable();
  colorizer.enable();

  logDebug("Extension enabled");
}

function disable() {
  logDebug("Disabling extension...");

  decorator.disable();
  colorizer.disable();
  scheduler.disable();
  settings.disable();

  decorator = null;
  colorizer = null;
  scheduler = null;
  settings = null;

  logDebug("Extension disabled");
}

function init() {
  logDebug("Initializing extension...");

  extensionUtils.initTranslations(Me.metadata["gettext-domain"]);
}
